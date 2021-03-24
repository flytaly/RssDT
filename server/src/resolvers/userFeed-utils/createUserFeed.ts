import FeedParser from 'feedparser';
import { getConnection, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Feed } from '../../entities/Feed';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { createSanitizedItem } from '../../feed-parser/filter-item';
import { insertNewItems } from '../../feed-watcher/watcher-utils';
import { ArgumentError } from '../resolver-types/errors';
import { UserFeedOptionsInput } from '../resolver-types/inputs';
import { processFeed } from './processFeed';
import { upsertUserAndReturn } from './upsertUser';

export type UserInfo = {
  locale?: string;
  timeZone?: string;
};

// creates activated feed with items
export const saveActivatedFeed = async (
  url: string,
  feedMeta: FeedParser.Meta,
  feedItems: FeedParser.Item[],
  queryRunner: QueryRunner,
) => {
  const ts = new Date();
  const feed = Feed.create({ url });
  feed.addMeta(feedMeta);
  feed.activated = true;
  feed.lastUpdAttempt = ts;
  feed.lastSuccessfulUpd = ts;
  feed.updateLastPubdate(feedItems);
  await queryRunner.manager.save(feed);
  if (feedItems?.length) {
    const itemsToSave = feedItems.map((item) => createSanitizedItem(item, feed.id));
    await insertNewItems(itemsToSave, queryRunner);
  }
  return feed;
};

// creates not activated feed with items
export const saveNotActivatedFeed = async (
  url: string,
  feedMeta: FeedParser.Meta,
  qR: QueryRunner,
) => {
  const feed = Feed.create({ url });
  feed.addMeta(feedMeta);
  feed.activated = false;
  await qR.manager.save(feed);
  return feed;
};

interface CreateUserFeedArgs {
  url: string;
  email?: string | null;
  user?: User | null;
  userInfo?: UserInfo | null;
  feedOpts?: UserFeedOptionsInput;
}

/**
 * Creates userFeed record and upsert feed and user records based on url and email respectively.
 */
export const createUserFeed = async ({
  url: $url,
  email,
  user,
  userInfo,
  feedOpts,
}: CreateUserFeedArgs) => {
  if (!email && !user) throw new Error('Not enough arguments to create new user feed');
  // eslint-disable-next-line prefer-const
  let { feed, errors, url, feedMeta, feedItems } = await processFeed($url);
  if (errors) return { errors };

  let userFeed: UserFeed | undefined;

  const qR = getConnection().createQueryRunner();
  await qR.connect();
  await qR.startTransaction();
  try {
    user = user || (await upsertUserAndReturn(qR, email!, userInfo));
    const userId = user.id;
    const activate = user.emailVerified;

    if (feed) {
      userFeed = await qR.manager.findOne(UserFeed, {
        where: { userId, feedId: feed.id },
      });
      if (userFeed?.activated) throw new Error('feed was already added');
    }
    if (!feed) {
      feed = activate
        ? await saveActivatedFeed(url!, feedMeta!, feedItems!, qR)
        : await saveNotActivatedFeed(url!, feedMeta!, qR);
    }

    userFeed =
      userFeed ||
      UserFeed.create({
        feed: feed!,
        userId: userId!,
        feedId: feed.id,
      });
    userFeed.activated = userFeed.activated || activate;
    if (activate && !feed.activated) {
      feed.activated = true;
      await qR.manager.save(feed);
    }
    const ts = new Date();
    userFeed.lastViewedItemDate = ts;
    if (!userFeed.unsubscribeToken) userFeed.unsubscribeToken = uuidv4();
    userFeed.feed = feed;
    if (feedOpts) qR.manager.getRepository(UserFeed).merge(userFeed, feedOpts);
    await qR.manager.save(userFeed);
    await qR.commitTransaction();
  } catch (err) {
    const field = err.message === 'feed was already added' ? 'url' : '';
    errors = [new ArgumentError(field, err.message)];
    await qR.rollbackTransaction();
  } finally {
    await qR.release();
  }

  return { errors, userFeed: errors ? null : userFeed, feed, user };
};
