import DataLoader from 'dataloader';
import { getConnection } from 'typeorm';

export const createItemCountLoader = () =>
  new DataLoader<number, number>(async (userFeedIds) => {
    const result: Array<{ id: number; count: number }> = await getConnection()
      .createQueryBuilder()
      .select('uf."id" as id, COUNT(1) as count')
      .from('user_feed', 'uf')
      .innerJoin(
        'item',
        'items',
        `uf."feedId" = items."feedId"
        AND (
          uf."lastViewedItemDate" IS NULL
          OR items."createdAt" > uf."lastViewedItemDate"
        )`,
      )
      .whereInIds(userFeedIds)
      .groupBy('uf."id"')
      .execute();

    const userFeedIdToCount: Record<number, number> = {};
    result.forEach(({ id, count }) => {
      userFeedIdToCount[id] = count;
    });

    return userFeedIds.map((userFeedId) => userFeedIdToCount[userFeedId] || 0);
  });
