/* eslint-disable no-await-in-loop */
import { getConnection } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { updateFeedData } from '../../feed-watcher/watcher-utils';
import { logger } from '../../logger';

export const activateUserFeed = async (userFeedId: number, userId?: number) => {
  const qb = getConnection().createQueryBuilder();

  // Update UserFeed
  const updResult = await qb
    .update(UserFeed)
    .set({ activated: true, lastDigestSentAt: new Date() })
    .where({ id: userFeedId, ...(userId ? { userId } : {}) })
    .returning('*')
    .execute();
  if (!updResult.raw.length) return { errors: [{ message: "couldn't activate feed" }] };
  const userFeed = updResult.raw[0] as UserFeed;
  userFeed.activated = true;

  // Update Feed
  const feedUpdResult = await qb
    .update(Feed)
    .set({ activated: true })
    .where({ id: userFeed.feedId, activated: false })
    .returning('*')
    .execute();
  const feed = feedUpdResult.raw[0] as Feed;
  userFeed.feed = feed;

  // Update User
  await qb.update(User).set({ emailVerified: true }).where({ id: userFeed.userId }).execute();

  (async () => {
    await updateFeedData(feed.url, true);
    await qb
      .update(UserFeed)
      .set({ lastDigestSentAt: new Date() })
      .where({ id: userFeedId, ...(userId ? { userId } : {}) })
      .execute();
  })();

  return { userFeed };
};

export const activateAllUserFeeds = async (userId: number) => {
  try {
    const qb = getConnection().createQueryBuilder();

    // Update UserFeed
    const updResult = await qb
      .update(UserFeed)
      .set({ activated: true, lastDigestSentAt: new Date() })
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

    Promise.all(
      feedsToUpdate.map(async ({ userFeed, url }) => {
        await updateFeedData(url);
        if (!userFeed) return;
        await qb
          .update(UserFeed)
          .set({ lastDigestSentAt: new Date() })
          .where({ id: userFeed.id })
          .execute();
      }),
    ).catch((e) => logger.error(e));

    return feedUpdResult;
  } catch (error) {
    logger.error(error);
  }
  return null;
};
