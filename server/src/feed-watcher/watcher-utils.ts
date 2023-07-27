import {
  feedUpdateInterval,
  FEED_LOCK_URL_PREFIX,
  IS_TEST,
  maxItemsInFeed,
  maxOldItemsInFeed,
} from '#root/constants.js';
import { db, type DB } from '#root/db/db.js';
import {
  enclosures,
  Feed,
  feeds,
  items,
  NewEnclosure,
  NewItemWithEnclosures,
  updateLastPubdateFromItems,
} from '#root/db/schema.js';
import { createSanitizedItem, filterMeta } from '#root/feed-parser/filter-item.js';
import { getNewItems } from '#root/feed-parser/index.js';
import { logger } from '#root/logger.js';
import { redis } from '#root/redis.js';
import { RepeatOptions } from 'bullmq';
import { sql } from 'drizzle-orm';
import moment from 'moment';

export type PartialFeed = {
  id: number;
  url: string;
  throttled: number;
  lastUpdAttempt: Date;
  lastSuccessfulUpd: Date;
};

export let getFeedsToUpdate = async (minutes = 0) => {
  const where = sql`${feeds.activated} = true`;
  if (minutes) {
    const date = new Date(Date.now() - 1000 * 60 * minutes);
    where.append(sql` AND ${feeds.lastUpdAttempt} < ${date}`);
  }

  return db
    .select({
      id: feeds.id,
      url: feeds.url,
      throttled: feeds.throttled,
      lastUpdAttempt: feeds.lastUpdAttempt,
      lastSuccessfulUpd: feeds.lastSuccessfulUpd,
    })
    .from(feeds)
    .where(where)
    .orderBy(sql`${feeds.throttled} asc, ${feeds.lastUpdAttempt} asc`);
};

export enum Status {
  Success = 1,
  Fail = 0,
}

const getItemsWithPubDate = (feedId: number) =>
  db
    .select({
      title: items.title,
      pubdate: items.pubdate,
      guid: items.guid,
    })
    .from(items)
    .where(sql`${items.feedId} = ${feedId}`)
    .orderBy(sql`${items.pubdate} desc`)
    .limit(50);

export const insertNewItems = async (connection: DB, insertingItems: NewItemWithEnclosures[]) => {
  if (insertingItems.length === 0) return;
  const inserted = await connection
    .insert(items)
    .values(insertingItems)
    .returning({ itemId: items.id });

  const encs: NewEnclosure[] = [];
  insertingItems.forEach((item, index) => {
    if (!item.enclosures?.length) return;
    const enc = item.enclosures.map((e) => ({
      ...e,
      itemId: inserted[index].itemId,
    }));
    encs.push(...enc);
  });
  if (encs.length === 0) return;
  await connection.insert(enclosures).values(encs).execute();
};

/**
 * Delete items that exceeded limits
 * @param limitWeekOld - limit items that was created > one week ago
 * */
export const deleteOldItems = async (
  feedId: number,
  limitTotal = maxItemsInFeed,
  limitWeekOld = maxOldItemsInFeed,
) => {
  if (!feedId) return 0;
  const query = sql`
        DELETE FROM ${items}
        WHERE ${items.feedId} = ${feedId}
        AND ${items.id} IN ((
            SELECT ${items.id}
            FROM ${items}
            WHERE
                ${items.feedId} = ${feedId}
            ORDER BY
                ${items.createdAt} DESC,
                ${items.pubdate} DESC
            OFFSET ${limitTotal}
        ) UNION (
                SELECT ${items.id}
                FROM ${items}
                WHERE
                    ${items.feedId} = ${feedId}
                    AND ${items.createdAt} <= ${moment().subtract(1, 'week').toDate()}
                ORDER BY
                    ${items.createdAt} DESC,
                    ${items.pubdate} DESC
                OFFSET ${limitWeekOld}
        ));
    `;
  const results = await db.execute(query);
  return results.rowCount;
};

export type UpdateFeedResult = readonly [Status, number, Feed | undefined | null];

/**
 * @param url - Feed URL
 * @param skipRecent - skip update if the feed was already updated recently
 */
export let updateFeedData = async (url: string, skipRecent = false): Promise<UpdateFeedResult> => {
  let newItemsNum = 0;
  let deletedItemsNum = 0;
  let status: Status = Status.Fail;
  if (!url) return [status, newItemsNum, null];

  const lockKey = FEED_LOCK_URL_PREFIX + url;
  if ((await redis.get(lockKey)) === 'lock') {
    logger.info({ url }, 'feed is locked. skip');
    return [status, newItemsNum, null];
  }
  await redis.set(lockKey, 'lock', 'EX', 60 * 4);

  const where = sql`${feeds.url} = ${url}`;
  if (skipRecent) {
    where.append(sql` AND ${feeds.lastUpdAttempt} < ${new Date(Date.now() - 1000 * 60 * 4)}`);
  }
  const selected = await db.select().from(feeds).where(where).execute();
  let feed = selected[0];

  if (feed) {
    const ts = new Date();
    feed.lastUpdAttempt = ts;
    try {
      const prevItems = await getItemsWithPubDate(feed.id);
      const { feedItems, feedMeta } = await getNewItems(url, prevItems);
      Object.assign(feed, filterMeta(feedMeta));
      updateLastPubdateFromItems(feed, feedItems);
      feed.lastSuccessfulUpd = ts;
      feed.throttled = Math.max(0, feed.throttled - 2);
      const updated = await db
        .update(feeds)
        .set(feed)
        .where(sql`${feeds.id} = ${feed.id}`)
        .returning();
      feed = updated[0];
      if (feedItems?.length) {
        const itemsToSave = feedItems.map((item) => createSanitizedItem(item, feed.id));
        await insertNewItems(db, itemsToSave);
        const deleted = await deleteOldItems(feed.id);
        deletedItemsNum += deleted;
        newItemsNum += itemsToSave.length;
      }
      status = Status.Success;
      logger.info({ url, newItemsNum, deletedItemsNum }, `feed was updated`);
    } catch (error) {
      logger.error({ url }, `feed wasn't updated: ${error.message}`);
      if (IS_TEST) throw error;

      const throttled = Math.min(6, feed.throttled + 1);
      const updated = await db
        .update(feeds)
        .set({ throttled })
        .where(sql`${feeds.id} = ${feed.id}`)
        .returning();
      feed = updated[0];
    }
  }

  await redis.del(lockKey);
  return [status, newItemsNum, feed];
};

export const getFeedUpdateInterval = (throttled = 0): RepeatOptions['every'] => {
  return throttled ? feedUpdateInterval * throttled : feedUpdateInterval;
};

export const mockWatcherUtils = ({
  getFeedsToUpdateMock,
  updateFeedDataMock,
}: {
  getFeedsToUpdateMock?: typeof getFeedsToUpdate;
  updateFeedDataMock?: typeof updateFeedData;
}) => {
  if (getFeedsToUpdateMock) getFeedsToUpdate = getFeedsToUpdateMock;
  if (updateFeedDataMock) updateFeedData = updateFeedDataMock;
};
