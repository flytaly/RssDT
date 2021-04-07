import test, { ExecutionContext } from 'ava';
import faker from 'faker';
import { getConnection, getRepository } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Feed, Item, User, UserFeed } from '#entities';
import { createSanitizedItem } from '../../feed-parser/filter-item.js';
import { insertNewItems } from '../../feed-watcher/watcher-utils.js';
import { getSdk } from '../graphql/generated.js';
import { startTestServer, stopTestServer } from '../test-server.js';
import '../test-utils/connection.js';
import { generateItem, generateMeta } from '../test-utils/generate-feed.js';
import { generateUserAndGetSdk } from '../test-utils/login.js';

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
const updateItemsCreationDate = async (items: Item[]) => {
  const qb = getConnection().createQueryBuilder();
  const result = await Promise.all(
    items.map((item) =>
      qb
        .update(Item)
        .set({ createdAt: item.pubdate })
        .where('id = :id', { id: item.id })
        .returning(`*`)
        .execute(),
    ),
  );
  return result.map((r) => r.raw[0]) as Item[];
};

async function generateTestData() {
  const { sdk: $sdk, user } = await generateUserAndGetSdk();
  sdk = $sdk;
  const feed = await getRepository(Feed)
    .merge(new Feed(), generateMeta(), { url: faker.internet.url() })
    .save();
  const userFeed = await UserFeed.create({ userId: user.id, feedId: feed.id }).save();
  const itemsToSave = generateItems(itemTitlesList.length)
    .map((item) => createSanitizedItem(item, feed.id))
    .map((item, idx) => ({ ...item, title: itemTitlesList[idx] })) as Item[];
  await insertNewItems(itemsToSave);
  const items = await updateItemsCreationDate(itemsToSave);
  const itemsGuids = [...itemsToSave.map((i) => i.guid!)];
  testData = { feed, itemsGuids, user, items, userFeed };
}

test.before(async () => {
  await startTestServer();
  await generateTestData();
});
test.after(() => stopTestServer());

test.serial('Paginated items: fetch items', async (t) => {
  const take = 2;
  const { myFeedItems } = await sdk.myFeedItems({ feedId: testData.feed.id, take, skip: 0 });
  const receivedItems = myFeedItems.items.map((i) => i.guid);
  t.is(receivedItems.length, take);
  t.true(myFeedItems.hasMore);
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
  const res = await sdk.setLastViewedItemDate({
    userFeedId: testData.userFeed.id,
    itemId: testData.items[0].id,
  });
  t.truthy(res.setLastViewedItemDate?.lastViewedItemDate);
  const savedDate = new Date(res.setLastViewedItemDate?.lastViewedItemDate);
  t.is(savedDate.getTime(), new Date(testData.items[0].createdAt).getTime());
});

test.serial('newItemsCount: all items are unread', async (t) => {
  testData.userFeed.lastViewedItemDate = null;
  await testData.userFeed.save();
  const response = await sdk.myFeeds();
  t.is(response.myFeeds?.[0].newItemsCount, testData.items.length);
});

test.serial('newItemsCount: 0 unread items', async (t) => {
  testData.userFeed.lastViewedItemDate = testData.items[0].createdAt;
  await testData.userFeed.save();
  const response = await sdk.myFeeds();
  t.is(response.myFeeds?.[0].newItemsCount, 0);
});

test.serial('newItemsCount: 3 unread items', async (t) => {
  testData.userFeed.lastViewedItemDate = testData.items[3].createdAt;
  await testData.userFeed.save();
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
