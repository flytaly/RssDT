import { type DB } from '#root/db/db';
import { feeds, userFeeds } from '#root/db/schema.js';
import { updateFeedData } from '#root/feed-watcher/watcher-utils.js';
import { logger } from '#root/logger.js';
import { and, eq, inArray, sql } from 'drizzle-orm';

export async function activateAllUserFeeds(db: DB, userId: number) {
  try {
    const { userFeedList, feedList } = await db.transaction(async (tx) => {
      // Update UserFeeds
      const updateUserFeeds = await tx
        .update(userFeeds)
        .set({ activated: true })
        .where(sql`${userFeeds.userId} = ${userId} and ${userFeeds.activated} = false`)
        .returning();
      if (!updateUserFeeds.length) return {};

      // Update Feed
      const feedIds = updateUserFeeds.map((uf) => uf.feedId);
      const updatedFeeds = await tx
        .update(feeds)
        .set({ activated: true })
        .where(and(inArray(feeds.id, feedIds), eq(feeds.activated, false)))
        .returning({ id: feeds.id, url: feeds.url });

      return { userFeedList: updateUserFeeds, feedList: updatedFeeds };
    });
    if (!feedList?.length || !userFeedList?.length) return null;

    void Promise.all(feedList.map((f) => updateFeedData(f.url))).catch((e) => logger.error(e));

    return feedList;
  } catch (error) {
    logger.error(error);
    return null;
  }
}
