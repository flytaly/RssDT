import faker from 'faker';
import { getConnection, getRepository } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Feed, Item, User, UserFeed } from '#entities';

import { createSanitizedItem } from '../../feed-parser/filter-item.js';
import { insertNewItems } from '../../feed-watcher/watcher-utils.js';
import { getSdk } from '../graphql/generated.js';
import '../test-utils/connection.js';
import { generateItem, generateMeta } from '../test-utils/generate-feed.js';
import { generateUserAndGetSdk } from '../test-utils/login.js';

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

describe('Feed items resolvers', () => {
  let feed: Feed;
  const itemsGuids: string[] = [];
  let sdk: ReturnType<typeof getSdk>;
  let user: User;
  let items: Item[];
  let userFeed: UserFeed;

  beforeAll(async () => {
    ({ sdk, user } = await generateUserAndGetSdk());
    feed = await getRepository(Feed)
      .merge(new Feed(), generateMeta(), { url: faker.internet.url() })
      .save();
    userFeed = new UserFeed();
    userFeed.userId = user.id;
    userFeed.feedId = feed.id;
    await userFeed.save();
    const itemsToSave = generateItems(itemTitlesList.length)
      .map((item) => createSanitizedItem(item, feed.id))
      .map((item, idx) => ({ ...item, title: itemTitlesList[idx] })) as Item[];
    await insertNewItems(itemsToSave);
    items = await updateItemsCreationDate(itemsToSave);
    itemsGuids.push(...itemsToSave.map((i) => i.guid));
  });

  afterAll(async () => {
    await feed.remove();
    await user.remove();
  });

  describe('Paginated items', () => {
    test('should fetch items', async () => {
      const take = 2;
      const { myFeedItems } = await sdk.myFeedItems({ feedId: feed.id, take, skip: 0 });
      const receivedItems = myFeedItems.items.map((i) => i.guid);
      expect(receivedItems).toHaveLength(take);
      expect(myFeedItems.hasMore).toBeTruthy();
      expect(receivedItems).toEqual(itemsGuids.slice(0, take));

      const nextTake = 3;
      const { myFeedItems: nextItems } = await sdk.myFeedItems({
        feedId: feed.id,
        take: nextTake,
        skip: take,
      });
      expect(nextItems.items.map((i) => i.guid)).toEqual(itemsGuids.slice(take, take + nextTake));
    });
  });

  describe('Unread items', () => {
    test('should set lastViewedItemDate field', async () => {
      const res = await sdk.setLastViewedItemDate({ userFeedId: userFeed.id, itemId: items[0].id });
      expect(res.setLastViewedItemDate?.lastViewedItemDate).not.toBeNull();
      const savedDate = new Date(res.setLastViewedItemDate?.lastViewedItemDate);
      expect(savedDate.getTime()).toBe(new Date(items[0].createdAt).getTime());
    });
    test('should return total number of items if lastDigestSentAt is null', async () => {
      userFeed.lastViewedItemDate = null;
      await userFeed.save();
      const response = await sdk.myFeeds();
      expect(response.myFeeds?.[0].newItemsCount).toBe(items.length);
    });

    test("should return 0 number of items if lastDigestSentAt >= last item's date", async () => {
      userFeed.lastViewedItemDate = items[0].createdAt;
      await userFeed.save();
      const response = await sdk.myFeeds();
      expect(response.myFeeds?.[0].newItemsCount).toBe(0);
    });

    test('should return number of new items', async () => {
      userFeed.lastViewedItemDate = items[3].createdAt;
      await userFeed.save();
      const response = await sdk.myFeeds();
      expect(response.myFeeds?.[0].newItemsCount).toBe(3);
    });
  });

  describe('Filter items', () => {
    const pick = (arr: any[], indexes: number[]) => indexes.map((idx) => arr[idx]);

    const expectFilteredItems = async (filter: string, expectedTitles: string[]) => {
      const { myFeedItems } = await sdk.myFeedItems({ feedId: feed.id, skip: 0, filter });

      const targetSet = new Set(expectedTitles);
      const receivedSet = new Set(myFeedItems.items.map((i) => i.title));
      expect(receivedSet.size).toBe(targetSet.size);
      receivedSet.forEach((title) => expect(targetSet.has(title!)).toBeTruthy());
    };

    test('should return all items with empty filter', async () => {
      await expectFilteredItems('', itemTitlesList);
    });
    test('should filter items with AND syntax', async () => {
      await expectFilteredItems('fox', pick(itemTitlesList, [0, 2, 5, 6]));
      await expectFilteredItems('quick fox', pick(itemTitlesList, [0, 5]));
      await expectFilteredItems('quick+zephyrs', pick(itemTitlesList, [8, 9]));
    });

    test('should filter items with OR syntax', async () => {
      await expectFilteredItems('quick, zephyrs', pick(itemTitlesList, [0, 4, 5, 8, 9]));
      await expectFilteredItems('quick | zephyrs', pick(itemTitlesList, [0, 4, 5, 8, 9]));
    });

    test('should filter items with NOT syntax', async () => {
      await expectFilteredItems('quick -zephyrs', pick(itemTitlesList, [0, 4, 5]));
    });

    test('should filter items with combined syntax', async () => {
      await expectFilteredItems('quick zephyrs, vixens', pick(itemTitlesList, [7, 8, 9]));
      await expectFilteredItems('quick+zephyrs|vixens', pick(itemTitlesList, [7, 8, 9]));
    });
  });
});
