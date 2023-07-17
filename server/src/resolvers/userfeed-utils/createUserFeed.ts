import { IS_TEST } from '#root/constants.js';
import { DB } from '#root/db/db.js';
import {
  Feed,
  feeds,
  NewFeed,
  NewUserFeed,
  updateLastPubdateFromItems,
  User,
  UserFeed,
  userFeeds,
  users,
} from '#root/db/schema.js';
import { createSanitizedItem, filterMeta } from '#root/feed-parser/filter-item.js';
import { insertNewItems } from '#root/feed-watcher/watcher-utils.js';
import { createUser } from '#root/resolvers/queries/createUser.js';
import { and, eq } from 'drizzle-orm';
import FeedParser from 'feedparser';
import { v4 as uuidv4 } from 'uuid';
import { updateFeedIcons } from '../../utils/updateFeedIcons.js';
import { ArgumentError } from '../resolver-types/errors.js';
import { UserFeedOptionsInput } from '../resolver-types/inputs.js';
import { processFeed } from './processFeed.js';

export type UserInfo = {
  locale?: string;
  timeZone?: string;
};

interface CreateUserFeedArgs {
  url: string;
  email?: string | null;
  user?: User | null;
  userInfo?: UserInfo | null;
  feedOpts?: UserFeedOptionsInput;
  onSuccess?: (uf: UserFeed, feed: Feed) => Promise<unknown>;
}

async function upsertUser(tx: DB, email: string, userInfo: UserInfo | null = {}): Promise<User> {
  const selected = await tx.select().from(users).where(eq(users.email, email!)).execute();
  if (!selected.length && userInfo) {
    const uList = await tx
      .update(users)
      .set({ ...userInfo })
      .where(eq(users.email, email!))
      .returning();
    return uList[0];
  }
  const created = await createUser(tx, { email: email!, ...userInfo });
  if (created.error) throw new Error(created.error.message);
  return created.user;
}

async function getNotActivatedUserFeed(tx: DB, feedId: number, userId: number) {
  const selected = await tx
    .select()
    .from(userFeeds)
    .where(and(eq(userFeeds.feedId, feedId), eq(userFeeds.userId, userId)))
    .execute();
  return selected[0];
}

interface CreateFeedArgs {
  url: string;
  activate: boolean;
  feedMeta?: FeedParser.Meta;
  feedItems?: FeedParser.Item[];
}

async function createFeed(tx: DB, { url, activate, feedMeta, feedItems = [] }: CreateFeedArgs) {
  if (activate) {
    // creates activated feed with items and site icons
    const ts = new Date();
    const newFeed: NewFeed = {
      url,
      activated: true,
      lastUpdAttempt: ts,
      lastSuccessfulUpd: ts,
      ...filterMeta(feedMeta),
    };
    updateLastPubdateFromItems(newFeed, feedItems);
    if (!IS_TEST) await updateFeedIcons(newFeed, null);
    const inserted = await tx.insert(feeds).values(newFeed).returning();
    const feed = inserted[0];
    if (feedItems?.length) {
      const itemsToSave = feedItems.map((item) => createSanitizedItem(item, feed.id));
      await insertNewItems(tx, itemsToSave);
    }
    return feed;
  }

  // creates not activated feed without items and site icons
  const newFeed: NewFeed = { url, activated: false, ...filterMeta(feedMeta) };
  const inserted = await tx.insert(feeds).values(newFeed).returning();
  return inserted[0];
}

interface UpsertUserFeedArgs {
  feed: Feed;
  activate: boolean;
  userFeed?: UserFeed | NewUserFeed;
  feedOpts?: UserFeedOptionsInput;
  userId: number;
}

async function upsertUserFeed(
  tx: DB,
  { feed, activate, userFeed, feedOpts, userId }: UpsertUserFeedArgs,
) {
  userFeed = userFeed || { userId: userId, feedId: feed.id };
  userFeed.activated = userFeed.activated || activate;
  userFeed.lastViewedItemDate = new Date();
  if (!userFeed.unsubscribeToken) userFeed.unsubscribeToken = uuidv4();
  if (feedOpts) {
    if (feedOpts.title && feedOpts.title === feed.title) delete feedOpts.title;
    if (feedOpts.title) feedOpts.title = feedOpts.title.slice(0, 50);
    userFeed = { ...userFeed, ...feedOpts };
  }
  if (userFeed.id) {
    const results = await tx
      .update(userFeeds)
      .set(userFeed)
      .where(eq(userFeeds.id, userFeed.id))
      .returning();
    return results[0];
    /* .onConflictDoUpdate({ target: userFeed.id, set: userFeed }); */
  }
  const results = await tx.insert(userFeeds).values(userFeed).returning();
  return results[0];
}

/** Creates userFeed record and upsert feed and user records based on url and email respectively */
export const createUserFeed = async (
  db: DB,
  { url: $url, email, user, userInfo, feedOpts, onSuccess }: CreateUserFeedArgs,
) => {
  if (!email && !user) throw new Error('Not enough arguments to create new user feed');
  const isLoggedIn = Boolean(!email && user);
  let { feed, errors, url, feedMeta, feedItems } = await processFeed(db, $url);
  if (errors) return { errors };

  let userFeed: UserFeed | undefined;
  try {
    await db.transaction(async (tx) => {
      user = user || (await upsertUser(tx, email!, userInfo));
      const userId = user.id;
      const activate = user.emailVerified && isLoggedIn;

      if (feed) {
        userFeed = await getNotActivatedUserFeed(tx, feed.id, userId);
        if (userFeed?.activated) throw new Error('feed was already added');
      }
      feed = feed || (await createFeed(tx, { url: url!, activate, feedMeta, feedItems }));
      if (activate && !feed.activated) {
        feed.activated = true;
        await tx.update(feeds).set(feed).where(eq(feeds.id, feed.id));
      }

      userFeed = await upsertUserFeed(tx, { feed, activate, userFeed, feedOpts, userId });
      if (!activate && !IS_TEST) void updateFeedIcons(feed, db); // update asynchronously without waiting
    });
  } catch (err) {
    const field = err.message === 'feed was already added' ? 'url' : '';
    errors = [new ArgumentError(field, err.message)];
  }

  if (onSuccess && !errors && userFeed && feed) void onSuccess(userFeed, feed);

  return { errors, userFeed: errors ? null : userFeed, feed, user };
};
