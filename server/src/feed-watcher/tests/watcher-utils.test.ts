import '#root/dotenv.js';
import 'reflect-metadata';

import { db } from '#root/db/db.js';
import { NewFeed, NewItem, feeds, items } from '#root/db/schema.js';
import { ItemWithPubdate, getNewItemsMock } from '#root/feed-parser/parse-utils.js';
import { updateFeedData } from '#root/feed-watcher/watcher-utils.js';
import { deleteFeedWithUrl } from '#root/tests/test-utils/dbQueries.js';
import { generateItem, generateMeta } from '#root/tests/test-utils/generate-feed.js';
import test from 'ava';
import { eq } from 'drizzle-orm';
import faker from 'faker';
import type { Item as FeedParserItem, Meta as FeedParserMeta } from 'feedparser';
import sinon from 'sinon';

const feedUrl = faker.internet.url();
const oldItems = [
  generateItem(new Date(Date.now() - 2 * 360000)),
  generateItem(new Date(Date.now() - 3 * 360000)),
  generateItem(new Date(Date.now() - 360000)),
];
const feedMeta = generateMeta();
test.before(async () => {
  const newFeed: NewFeed = { ...feedMeta, url: feedUrl };
  const insertedFeeds = await db.insert(feeds).values(newFeed).returning();

  const itemsToInsert = oldItems.map((i) => ({ ...i, feedId: insertedFeeds[0].id } as NewItem));
  await db.insert(items).values(itemsToInsert).returning();
});

test.after(async () => {
  await deleteFeedWithUrl(db, feedUrl);
});

test.serial("update feed's data", async (t) => {
  const newItems = [
    generateItem(new Date(Date.now() - 1000)), //
    generateItem(new Date(Date.now())),
  ];
  const newMeta = { title: 'new Title', description: 'new description' };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fakeGetNewItems = sinon.fake(async (url: string, existingItems?: ItemWithPubdate[]) => ({
    feedItems: newItems as FeedParserItem[],
    feedMeta: newMeta as FeedParserMeta,
  }));
  getNewItemsMock(fakeGetNewItems);

  await updateFeedData(feedUrl);
  const urlPassed = fakeGetNewItems.lastCall.args[0];
  const existingItemsPassed = fakeGetNewItems.lastCall.args[1];
  t.is(urlPassed, feedUrl, 'feed url');
  t.is(existingItemsPassed?.length, oldItems.length, 'correct items length');
  const sorted = oldItems.sort((a, b) => b.pubdate?.getTime() - a.pubdate?.getTime());
  existingItemsPassed?.forEach((i, idx) => t.is(i.guid, sorted[idx].guid));

  const selectedFeeds = await db.query.feeds.findMany({
    with: { items: true },
    where: eq(feeds.url, feedUrl),
  });
  t.is(selectedFeeds.length, 1);
  const updatedFeed = selectedFeeds[0];
  t.like(updatedFeed, newMeta);
  t.is(updatedFeed.items?.length, oldItems.length + newItems.length);
  newItems.forEach(({ guid }) => {
    t.truthy(updatedFeed.items?.find((i) => guid === i.guid));
  });
});

test.serial('feed should have correct lastPubdate timestamp', async (t) => {
  const selectedFeeds = await db.select().from(feeds).where(eq(feeds.url, feedUrl)).execute();
  const selectedItems = await db
    .select()
    .from(items)
    .where(eq(items.feedId, selectedFeeds[0]?.id))
    .execute();
  const pubdate = Math.max(...selectedItems.map((i) => i.pubdate?.getTime() || 0));
  t.is(selectedFeeds[0]?.lastPubdate?.getTime(), pubdate);
});
