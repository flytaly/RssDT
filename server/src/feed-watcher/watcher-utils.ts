import { abortPendingRequests } from 'nock/types';
import { getConnection, LessThan } from 'typeorm';
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

const insertNewItems = (items: Item[]) =>
    getConnection().createQueryBuilder().insert().into(Item).values(items).execute();

export const updateFeedData = async (url: string) => {
    let newItemsNum = 0;
    let status: Status = Status.Fail;
    // TODO: Lock feed
    const feed = await Feed.findOne({ where: { url } });
    if (feed) {
        try {
            const prevItems = await getItemsWithPubDate(feed.id);
            const { feedItems, feedMeta } = await getNewItems(url, prevItems);
            feed.addMeta(feedMeta);
            feed.throttled = Math.max(0, feed.throttled - 2);
            await feed.save();
            if (feedItems?.length) {
                await insertNewItems(feedItems.map(createSanitizedItem));
                newItemsNum += feedItems.length;
            }
            status = Status.Success;
            logger.info({ url, newItemsNum }, `feed was updated`);
        } catch (error) {
            logger.error({ url }, `feed wasn't updated: ${error.message}`);
            feed.throttled = Math.min(10, feed.throttled + 1);
            await feed.save();
        }
    }
    return [status, newItemsNum];
};
