import { getConnection } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { UserFeed } from '../../entities/UserFeed';
import { updateFeedData } from '../../feed-watcher/watcher-utils';
import { logger } from '../../logger';

export async function activateAllUserFeeds(userId: number) {
  try {
    const qb = getConnection().createQueryBuilder();

    // Update UserFeed
    const updResult = await qb
      .update(UserFeed)
      .set({ activated: true })
      .where({ userId, activated: false })
      .returning('*')
      .execute();
    if (!updResult.raw.length) return null;
    const userFeeds = updResult.raw as UserFeed[];

    // Update Feed
    const feedUpdResult = await qb
      .update(Feed)
      .set({ activated: true })
      .where(userFeeds.map((uf) => ({ id: uf.feedId, activated: false })))
      .returning('id, url')
      .execute();

    if (!feedUpdResult.raw.length) return null;
    const feeds = feedUpdResult.raw as Feed[];

    const feedsToUpdate = feeds.map(({ url, id }) => ({
      url,
      userFeed: userFeeds.find((uf) => uf.feedId === id),
    }));

    Promise.all(feedsToUpdate.map(({ url }) => updateFeedData(url))).catch((e) => logger.error(e));

    return feedUpdResult;
  } catch (error) {
    logger.error(error);
  }
  return null;
}
