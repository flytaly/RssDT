/* eslint-disable import/no-cycle */
import DataLoader from 'dataloader';
import { getConnection } from 'typeorm';
import { NewItemsPayload } from '../resolvers/common/pubSubTopics';
import { UserFeedNewItemsCountResponse } from '../resolvers/userFeed';

export const createUpdatedFeedLoader = () =>
  new DataLoader<
    { userId: number; mapFeedToCount: NewItemsPayload },
    UserFeedNewItemsCountResponse[]
  >(async (keys) => {
    const { mapFeedToCount } = keys[0];
    const feedIds = Object.keys(mapFeedToCount);
    const userIds = keys.map((k) => k.userId);
    const result: Array<{
      feedId: number;
      userId: number;
      userFeedId: number;
    }> = await getConnection()
      .createQueryBuilder()
      .select('f."id" as "feedId", uf."userId" as "userId", uf."id" as "userFeedId"')
      .from('feed', 'f')
      .innerJoin('user_feed', 'uf', `uf."feedId" = f."id"`)
      .whereInIds(feedIds)
      .andWhere(`uf."userId" in (${userIds.join(', ')})`)
      .execute();

    const mapUserIdToResponse: Record<number, UserFeedNewItemsCountResponse[]> = {};
    result.forEach((r) => {
      const list = mapUserIdToResponse[r.userId] || [];
      list.push({ ...r, count: mapFeedToCount[r.feedId].count });
      mapUserIdToResponse[r.userId] = list;
    });

    return keys.map(({ userId }) => mapUserIdToResponse[userId]);
  });
