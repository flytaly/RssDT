import { sql } from 'drizzle-orm';

import { DB } from '#root/db/db.js';
import { items, userFeeds } from '#root/db/schema.js';

interface Args {
  itemId: number;
  userFeedId: number;
  userId: number;
}

export const setLastViewedItemDate = async (db: DB, { itemId, userFeedId, userId }: Args) => {
  const query = sql`
      UPDATE ${userFeeds}
      SET
          "${sql.raw(userFeeds.updatedAt.name)}" = CURRENT_TIMESTAMP,
          "${sql.raw(userFeeds.lastViewedItemDate.name)}" = it."createdAt"
      FROM
         (
           SELECT ${items.createdAt}
           FROM ${items}
           WHERE ${items.id} = ${itemId}
         ) AS it
       WHERE
          ${userFeeds.id} = ${userFeedId}
         AND ${userFeeds.userId} = ${userId}
       RETURNING *
  `;

  const results = await db.execute(query);
  return results.rows[0] || null;
};
