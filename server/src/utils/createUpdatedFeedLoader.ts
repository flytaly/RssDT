import DataLoader from 'dataloader';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '#root/db/db.js';
import { feeds, userFeeds } from '#root/db/schema.js';
import { NewItemsPayload } from '#root/resolvers/resolver-types/pubSubTopics.js';
import { UserFeedNewItemsCountResponse } from '#root/resolvers/resolver-types/userFeedTypes.js';

export const createUpdatedFeedLoader = () =>
  new DataLoader<
    { userId: number; mapFeedToCount: NewItemsPayload },
    UserFeedNewItemsCountResponse[]
  >(async (keys) => {
    const { mapFeedToCount } = keys[0];
    const feedIds = Object.keys(mapFeedToCount).map((k) => Number(k));
    const userIds = keys.map((k) => k.userId);

    const result = await db
      .select({
        feedId: feeds.id,
        userId: userFeeds.userId,
        userFeedId: userFeeds.id,
      })
      .from(feeds)
      .where(and(inArray(feeds.id, feedIds), inArray(userFeeds.userId, userIds)))
      .innerJoin(userFeeds, eq(userFeeds.feedId, feeds.id))
      .execute();

    const mapUserIdToResponse: Record<number, UserFeedNewItemsCountResponse[]> = {};
    result.forEach((r) => {
      const list = mapUserIdToResponse[r.userId] || [];
      list.push({ ...r, count: mapFeedToCount[r.feedId].count });
      mapUserIdToResponse[r.userId] = list;
    });

    return keys.map(({ userId }) => mapUserIdToResponse[userId]);
  });
