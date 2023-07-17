import { Feed, Item } from '#entities';
import { db, type DB } from '#root/db/db.js';
import { enclosures, items, NewEnclosure } from '#root/db/schema.js';
import { RepeatOptions } from 'bullmq';
import moment from 'moment';
import { getConnection, getManager, LessThan } from 'typeorm';
import {
  feedUpdateInterval,
  FEED_LOCK_URL_PREFIX,
  IS_TEST,
  maxItemsInFeed,
  maxOldItemsInFeed,
} from '../constants.js';
import { createSanitizedItem, NewItemWithEnclosures } from '../feed-parser/filter-item.js';
import { getNewItems } from '../feed-parser/index.js';
import { logger } from '../logger.js';
import { redis } from '../redis.js';

export type PartialFeed = {
  id: number;
  url: string;
  throttled: number;
  lastUpdAttempt: Date;
  lastSuccessfulUpd: Date;
};

export let getFeedsToUpdate = (minutes = 0) =>
  getConnection()
    .getRepository(Feed)
    .find({
      select: ['id', 'url', 'throttled', 'lastUpdAttempt', 'lastSuccessfulUpd'],
      order: {
        throttled: 'ASC',
        lastUpdAttempt: 'ASC',
      },
      where: [
        {
          activated: true,
          ...(minutes
            ? {
                lastUpdAttempt: LessThan(new Date(Date.now() - 1000 * 60 * minutes)),
              }
            : {}),
        },
      ],
    }) as Promise<PartialFeed[]>;

export enum Status {
  Success = 1,
  Fail = 0,
}

const getItemsWithPubDate = (feedId: number) =>
  getConnection()
    .createQueryBuilder(Item, 'item')
    .select(['item.pubdate', 'item.guid', 'item.title'])
    .where('item.feedId = :id', { id: feedId })
    .orderBy('pubdate', 'DESC')
    .take(50)
    .getMany() as Promise<
    {
      guid: string;
      pubdate: Date;
    }[]
  >;

export const insertNewItems = async (connection: DB, insertingItems: NewItemWithEnclosures[]) => {
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
  if (feedId) {
    const [, deletedNum] = await getManager().query(`
        DELETE FROM item
        WHERE item."feedId" = ${feedId}
        AND item."id" IN ((
                SELECT it."id"
                FROM item it
                WHERE
                    it."feedId" = ${feedId}
                ORDER BY
                    it."createdAt" DESC,
                    it."pubdate" DESC
                OFFSET ${limitTotal}
            ) UNION (
                SELECT it."id"
                FROM item it
                WHERE
                    it."feedId" = ${feedId}
                    AND it."createdAt" <= '${moment().subtract(1, 'week').toISOString()}'
                ORDER BY
                    it."createdAt" DESC,
                    it."pubdate" DESC
                OFFSET ${limitWeekOld}
            ));
    `);
    return deletedNum as number;
  }
  return 0;
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

  const feed = await Feed.findOne({
    where: {
      url,
      ...(skipRecent ? { lastUpdAttempt: LessThan(new Date(Date.now() - 1000 * 60 * 4)) } : {}),
    },
  });

  if (feed) {
    const ts = new Date();
    feed.lastUpdAttempt = ts;
    try {
      const prevItems = await getItemsWithPubDate(feed.id);
      const { feedItems, feedMeta } = await getNewItems(url, prevItems);
      feed.addMeta(feedMeta);
      feed.lastSuccessfulUpd = ts;
      feed.throttled = Math.max(0, feed.throttled - 2);
      feed.updateLastPubdate(feedItems);
      await feed.save();
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

      feed.throttled = Math.min(6, feed.throttled + 1);
      await feed.save();
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
