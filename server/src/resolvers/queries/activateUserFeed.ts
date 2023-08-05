import { DB } from '#root/db/db.js';
import { Feed, feeds, UserFeed, userFeeds } from '#root/db/schema.js';
import { sql } from 'drizzle-orm';

interface ActivateUserFeedArgs {
  userFeedId: number;
  userId?: number | null;
  onSuccess?: (uf: UserFeed, feed: Feed) => Promise<unknown>;
}

export async function activateUserFeed(
  db: DB,
  { userFeedId, userId, onSuccess }: ActivateUserFeedArgs,
) {
  // Update userFeed
  const whereSql = sql`${userFeeds.id} = ${userFeedId}`;
  if (userId) {
    whereSql.append(sql` AND ${userFeeds.userId} = ${userId}`);
  }
  const updatedUF = await db
    .update(userFeeds)
    .set({ activated: true }) //
    .where(whereSql)
    .returning();
  const userFeed = updatedUF[0];
  if (!userFeed) return { errors: [{ message: "couldn't activate feed" }] };

  // Update Feed
  const updatedFeeds = await db
    .update(feeds)
    .set({ activated: true })
    .where(sql`${feeds.id} = ${userFeed.feedId} AND ${feeds.activated} = false`)
    .returning();

  await onSuccess?.(userFeed, updatedFeeds[0]);

  return { userFeed: { ...userFeed, feed: updatedFeeds[0] } };
}
