import test from 'ava';
import faker from 'faker';
import sinon from 'sinon';
import { getRepository } from 'typeorm';
import '../../dotenv.js';
import { Feed, Item } from '#entities';
import { getNewItemsMock, ItemWithPubdate } from '../../feed-parser/parse-utils.js';
import { closeTestConnection, runTestConnection } from '../../tests/test-utils/connection.js';
import { deleteFeedWithUrl } from '../../tests/test-utils/dbQueries.js';
import { generateItem, generateMeta } from '../../tests/test-utils/generate-feed.js';
import { updateFeedData } from '../watcher-utils.js';

const feedUrl = faker.internet.url();
const oldItems = [
  generateItem(new Date(Date.now() - 2 * 360000)),
  generateItem(new Date(Date.now() - 3 * 360000)),
  generateItem(new Date(Date.now() - 360000)),
];
const feedMeta = generateMeta();
test.before(async () => {
  await runTestConnection();

  const feed = await getRepository(Feed).merge(new Feed(), feedMeta, { url: feedUrl }).save();
  await Promise.all(oldItems.map((i) => Item.create({ ...i, feedId: feed.id }).save()));
});

test.after(async () => {
  await deleteFeedWithUrl(feedUrl);
  await closeTestConnection();
});

test.serial("update feed's data", async (t) => {
  const newItems = [
    generateItem(new Date(Date.now() - 1000)), //
    generateItem(new Date(Date.now())),
  ];
  const newMeta = { title: 'new Title', description: 'new description' };
  const fakeGetNewItems = sinon.fake(async () => ({ feedItems: newItems, feedMeta: newMeta }));
  // @ts-ignore
  getNewItemsMock(fakeGetNewItems);

  await updateFeedData(feedUrl);
  // @ts-ignore
  const url: string = fakeGetNewItems.lastCall.args[0];
  // @ts-ignore
  const items: ItemWithPubdate[] = fakeGetNewItems.lastCall.args[1];
  t.is(url, feedUrl, 'feed url');
  t.is(items.length, oldItems.length, 'correct items length');
  const sorted = oldItems.sort((a, b) => b.pubdate?.getTime()! - a.pubdate?.getTime()!);
  items.forEach((i, idx) => t.is(i.guid, sorted[idx].guid));

  const feedUpd = await Feed.findOneOrFail({ where: { url: feedUrl }, relations: ['items'] });
  t.like(feedUpd, newMeta);
  t.is(feedUpd.items?.length, oldItems.length + newItems.length);
  newItems.forEach(({ guid }) => {
    t.truthy(feedUpd.items?.find((i) => guid === i.guid));
  });
});

test.serial('feed should have correct lastPubdate timestamp', async (t) => {
  const feedInDb = await Feed.findOne({ where: { url: feedUrl } });
  const items = await Item.find({ where: { feedId: feedInDb?.id } });
  const pubdate = Math.max(...items.map((i) => i.pubdate?.getTime() || 0));
  t.is(feedInDb?.lastPubdate?.getTime(), pubdate);
});
