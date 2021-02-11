import faker from 'faker';
import { getConnection, getRepository } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { Item } from '../../entities/Item';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { createSanitizedItem } from '../../feed-parser/filter-item';
import { insertNewItems } from '../../feed-watcher/watcher-utils';
import { getSdk } from '../graphql/generated';
import '../test-utils/connection';
import { generateItem, generateMeta } from '../test-utils/generate-feed';
import { generateUserAndGetSdk } from '../test-utils/login';

// Generate items with different pubdates
const generateItems = (num: number) =>
  new Array(num).fill('').map((_, idx) => generateItem(new Date(Date.now() - idx * 360000)));

// Set createdAt the same as pubdate
const updateItemsCreationDate = async (items: Item[]) => {
  const qb = getConnection().createQueryBuilder();
  const result = await Promise.all(
    items.map((item) =>
      qb.update(Item).set({ createdAt: item.pubdate }).where('id = :id', { id: item.id }).returning(`*`).execute(),
    ),
  );
  return result.map((r) => r.raw[0]) as Item[];
};

describe('Feed items resolvers', () => {
  let feed: Feed;
  const itemsGuids: string[] = [];
  let sdk: ReturnType<typeof getSdk>;
  let user: User;
  let items: Item[];
  let userFeed: UserFeed;

  beforeAll(async () => {
    ({ sdk, user } = await generateUserAndGetSdk());
    feed = await getRepository(Feed).merge(new Feed(), generateMeta(), { url: faker.internet.url() }).save();
    userFeed = new UserFeed();
    userFeed.userId = user.id;
    userFeed.feedId = feed.id;
    await userFeed.save();
    const itemsToSave = generateItems(10).map((item) => createSanitizedItem(item, feed.id));
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
      expect(myFeedItems.count).toBe(itemsGuids.length);
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
      expect(res.setLastViewedItemDate.lastViewedItemDate).not.toBeNull();
      const savedDate = new Date(res.setLastViewedItemDate.lastViewedItemDate);
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
});
