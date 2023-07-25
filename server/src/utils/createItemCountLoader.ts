import DataLoader from 'dataloader';
import { inArray, sql } from 'drizzle-orm';
import { db } from '#root/db/db.js';
import { items, userFeeds } from '#root/db/schema.js';

export const createItemCountLoader = () =>
  new DataLoader<number, number>(async (userFeedIds) => {
    const joinQuery = sql`${userFeeds.feedId} = ${items.feedId}
                AND (${userFeeds.lastViewedItemDate} IS NULL
                OR ${items.createdAt} > ${userFeeds.lastViewedItemDate})`;

    const result = await db
      .select({
        id: userFeeds.id,
        count: sql<number>`COUNT(1)`,
      })
      .from(userFeeds)
      .innerJoin(items, joinQuery)
      .where(inArray(userFeeds.id, [...userFeedIds]))
      .groupBy(userFeeds.id)
      .execute();

    const userFeedIdToCount: Record<number, number> = {};
    result.forEach(({ id, count }) => {
      userFeedIdToCount[id] = count;
    });

    return userFeedIds.map((userFeedId) => userFeedIdToCount[userFeedId] || 0);
  });
