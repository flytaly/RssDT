import { getConnection, getManager, LessThan } from 'typeorm';
import moment from 'moment';
import { IS_TEST } from '../constants';
import { Enclosure } from '../entities/Enclosure';
import { Feed } from '../entities/Feed';
import { Item } from '../entities/Item';
import { getNewItems } from '../feed-parser';
import { createSanitizedItem } from '../feed-parser/filter-item';
import { logger } from '../logger';

type PartialFeed = {
    id: number;
    url: string;
    throttled: number;
    lastUpdAttempt: Date;
    lastSuccessfulUpd: Date;
};

export const getFeedsToUpdate = (minutes = 4) =>
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
                    // TODO: activated: true,
                    lastUpdAttempt: LessThan(new Date(Date.now() - 1000 * 60 * minutes)),
                },
            ],
        }) as Promise<PartialFeed[]>;

enum Status {
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

export const insertNewItems = async (items: Item[]) => {
    const con = getConnection();
    const result = await con.createQueryBuilder().insert().into(Item).values(items).execute();
    const encs: Enclosure[] = [];
    items.forEach(({ enclosures }) => {
        if (enclosures?.length) {
            encs.push(...enclosures);
        }
    });
    await con.createQueryBuilder().insert().into(Enclosure).values(encs).execute();
    return result;
};

/**
 * Delete items that exceeded limits
 * @param limitWeekOld - limit items that was created > one week ago
 * */
export const deleteOldItems = async (feedId: number, limitTotal = 500, limitWeekOld = 50) => {
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

export const updateFeedData = async (url: string) => {
    let newItemsNum = 0;
    let deletedItemsNum = 0;
    let status: Status = Status.Fail;
    // TODO: Lock feed
    const feed = await Feed.findOne({ where: { url } });
    const ts = new Date();
    if (feed) {
        feed.lastUpdAttempt = ts;
        try {
            const prevItems = await getItemsWithPubDate(feed.id);
            const { feedItems, feedMeta } = await getNewItems(url, prevItems);
            feed.addMeta(feedMeta);
            feed.lastSuccessfulUpd = ts;
            feed.throttled = Math.max(0, feed.throttled - 2);
            await feed.save();
            if (feedItems?.length) {
                const itemsToSave = feedItems.map((item) => createSanitizedItem(item, feed.id));
                await insertNewItems(itemsToSave);
                const deleted = await deleteOldItems(feed.id);
                deletedItemsNum += deleted;
                newItemsNum += itemsToSave.length;
            }
            status = Status.Success;
            logger.info({ url, newItemsNum, deletedItemsNum }, `feed was updated`);
        } catch (error) {
            logger.error({ url }, `feed wasn't updated: ${error.message}`);
            if (IS_TEST) throw error;

            feed.throttled = Math.min(10, feed.throttled + 1);
            await feed.save();
        }
    }
    return [status, newItemsNum];
};
