import { type DB } from '#root/db/db.js';
import { userFeeds } from '#root/db/schema.js';
import { eq } from 'drizzle-orm';

export async function getUserFeeds(db: DB, userId: number) {
  const res = await db.query.userFeeds //
    .findMany({
      with: { feed: true },
      where: eq(userFeeds.userId, userId),
      // NOTE: orderBy doesn't work like this because you can't reference a field from another table.
      // So we can use db.select... and aggregate the result or sort with JS
      /* orderBy: desc(feeds.lastPubdate), */
    });
  return res;
}
