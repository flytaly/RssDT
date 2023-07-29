import { startTestServer, stopTestServer } from '#root/tests/test-server.js';

import { db } from '#root/db/db.js';
import { Feed, Item, User, UserFeed, feeds, items, userFeeds } from '#root/db/schema.js';
import { createSanitizedItem } from '#root/feed-parser/filter-item.js';
import { insertNewItems } from '#root/feed-watcher/watcher-utils.js';
import { getSdk } from '#root/tests/graphql/generated.js';
import { generateItem, generateMeta } from '#root/tests/test-utils/generate-feed.js';
import { createUserAndGetSdk } from '#root/tests/test-utils/login.js';
import test, { ExecutionContext } from 'ava';
import { eq } from 'drizzle-orm';
import faker from 'faker';
import { deleteFeedWithUrl, deleteUserWithEmail } from '../test-utils/dbQueries';

let sdk: ReturnType<typeof getSdk>;
let testData: {
  feed: Feed;
  itemsGuids: string[];
  user: User;
  items: Item[];
  userFeed: UserFeed;
};

const itemTitlesList = [
  'The quick, brown fox jumps over a lazy dog. ', // 0
  'DJs flock by when MTV ax quiz prog.', // 1
  'Junk MTV quiz graced by fox whelps. ', // 2
  'Bawds jog, flick quartz, vex nymphs.', // 3
  'Waltz, bad nymph, for quick jigs vex!', // 4
  'Fox nymphs grab quick-jived waltz.', // 5
  'Brick quiz whangs jumpy veldt fox.', // 6
  'Bright vixens jump; dozy fowl quack.', // 7
  'Quick wafting zephyrs vex bold Jim.', // 8
  'Quick zephyrs blow, vexing daft Jim.', // 9
];

// Generate items with different pubdates
const generateItems = (num: number) =>
  new Array(num).fill('').map((_, idx) => generateItem(new Date(Date.now() - idx * 360000)));

// Set createdAt the same as pubdate
const updateItemsCreationDate = async (itemList: Item[]) => {
  const results = await Promise.all(
    itemList.map(async (item) => {
      const updated = await db
        .update(items)
        .set({ createdAt: item.pubdate! })
        .where(eq(items.id, item.id))
        .returning();
      return updated[0];
    }),
  );
  return results;
};

async function generateItemsInDB(feedId: number) {
  const itemsToSave = generateItems(itemTitlesList.length)
    .map((item) => createSanitizedItem(item, feedId))
    .map((item, idx) => ({ ...item, title: itemTitlesList[idx] })) as Item[];
  const ids = await insertNewItems(db, itemsToSave);
  itemsToSave.forEach((item, index) => {
    item.id = ids[index].itemId;
  });
  const feedItems = await updateItemsCreationDate(itemsToSave);
  return feedItems;
}

async function generateTestData() {
  const { sdk: $sdk, user } = await createUserAndGetSdk(db);

  const newFeeds = await db
    .insert(feeds)
    .values({ ...generateMeta(), url: faker.internet.url() })
    .returning();
  const feed = newFeeds[0];
  const newUserFeeds = await db
    .insert(userFeeds)
    .values({ userId: user.id, feedId: feed.id, unsubscribeToken: 'token' })
    .returning();
  const userFeed = newUserFeeds[0];
  const testItems = await generateItemsInDB(feed.id);
  const itemsGuids = [...testItems.map((i) => i.guid!)];
  testData = { feed, itemsGuids, user, items: testItems, userFeed };

  sdk = $sdk;
}

test.before(async () => {
  await startTestServer();
  await generateTestData();
});

test.after(async () => {
  await deleteUserWithEmail(db, testData.user.email);
  await deleteFeedWithUrl(db, testData.feed.url);

  return stopTestServer();
});

test.serial('Paginated items: fetch items', async (t) => {
  const take = 2;
  const { myFeedItems } = await sdk.myFeedItems({ feedId: testData.feed.id, take, skip: 0 });
  const receivedItems = myFeedItems.items.map((i) => i.guid);
  t.is(receivedItems.length, take, `should receive ${take} items`);
  t.true(myFeedItems.hasMore, 'has more items');
  t.deepEqual(receivedItems, testData.itemsGuids.slice(0, take));

  const nextTake = 3;
  const { myFeedItems: nextItems } = await sdk.myFeedItems({
    feedId: testData.feed.id,
    take: nextTake,
    skip: take,
  });
  t.deepEqual(
    nextItems.items.map((i) => i.guid),
    testData.itemsGuids.slice(take, take + nextTake),
  );
});

test.serial('setLastViewedItemDate mutation', async (t) => {
  const { userFeed, items: testItems } = testData;
  const res = await sdk.setLastViewedItemDate({
    userFeedId: userFeed.id,
    itemId: testItems[0].id,
  });
  t.truthy(res.setLastViewedItemDate?.lastViewedItemDate);
  const savedDate = new Date(res.setLastViewedItemDate?.lastViewedItemDate);
  t.is(savedDate.getTime(), new Date(testItems[0].createdAt).getTime());
});

test.serial('newItemsCount: all items are unread', async (t) => {
  await db
    .update(userFeeds)
    .set({ lastViewedItemDate: null })
    .where(eq(userFeeds.id, testData.userFeed.id))
    .execute();
  const response = await sdk.myFeeds();
  t.is(response.myFeeds?.[0].newItemsCount, testData.items.length);
});

test.serial('newItemsCount: 0 unread items', async (t) => {
  await db
    .update(userFeeds)
    .set({ lastViewedItemDate: testData.items[0].createdAt })
    .where(eq(userFeeds.id, testData.userFeed.id))
    .execute();
  const response = await sdk.myFeeds();
  t.is(response.myFeeds?.[0].newItemsCount, 0);
});

test.serial('newItemsCount: 3 unread items', async (t) => {
  await db
    .update(userFeeds)
    .set({ lastViewedItemDate: testData.items[3].createdAt })
    .where(eq(userFeeds.id, testData.userFeed.id))
    .execute();
  const response = await sdk.myFeeds();
  t.is(response.myFeeds?.[0].newItemsCount, 3);
});

const pick = (arr: any[], indexes: number[]) => indexes.map((idx) => arr[idx]);

const expectFilteredItems = async (
  filter: string,
  expectedTitles: string[],
  t: ExecutionContext<unknown>,
) => {
  const { myFeedItems } = await sdk.myFeedItems({ feedId: testData.feed.id, skip: 0, filter });
  const targetSet = new Set(expectedTitles);
  const receivedSet = new Set(myFeedItems.items.map((i) => i.title));
  t.is(receivedSet.size, targetSet.size);
  t.deepEqual(receivedSet, targetSet);
};

test('filter items: return all items with empty filter', async (t) => {
  await expectFilteredItems('', itemTitlesList, t);
});

test('filter items: AND syntax', async (t) => {
  await expectFilteredItems('fox', pick(itemTitlesList, [0, 2, 5, 6]), t);
  await expectFilteredItems('quick fox', pick(itemTitlesList, [0, 5]), t);
  await expectFilteredItems('quick+zephyrs', pick(itemTitlesList, [8, 9]), t);
});

test('filter items: OR syntax', async (t) => {
  await expectFilteredItems('quick, zephyrs', pick(itemTitlesList, [0, 4, 5, 8, 9]), t);
  await expectFilteredItems('quick | zephyrs', pick(itemTitlesList, [0, 4, 5, 8, 9]), t);
});

test('filter items: NOT syntax', async (t) => {
  await expectFilteredItems('quick -zephyrs', pick(itemTitlesList, [0, 4, 5]), t);
});

test('filter items: combined syntax', async (t) => {
  await expectFilteredItems('quick zephyrs, vixens', pick(itemTitlesList, [7, 8, 9]), t);
  await expectFilteredItems('quick+zephyrs|vixens', pick(itemTitlesList, [7, 8, 9]), t);
});
