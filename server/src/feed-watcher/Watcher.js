const { CronJob } = require('cron');
const pLimit = require('p-limit');
const logger = require('../logger');
const { getNewItems } = require('../feed-parser');
const { filterAndClearHtml, filterMeta } = require('./utils');
const { buildAndSendDigests } = require('../mail-sender/dispatcher');
const redisCache = require('../cache');

class Watcher {
    /**
     * @param {object} db - connection to Prisma Binding
     * @param {string} cron - update schedule time in cron format
     * @param {object} [options]
     * @param {number} options.maxConnections=40 - maximum number of concurrent connection for updating feeds
     * @param {number} options.maxNewItems=150 - maximum number of new items saving per feed
     * @param {number} options.itemMaxTime - maximum time of storing items
     * @param {number} options.storeNumberOfItems - number of items to store after itemMaxTime
     * @param {object} options.cache - cache for locking current loading url
     */
    constructor(db, {
        cron = '*/5 * * * *',
        maxConnections = 40,
        maxNewItems = 150,
        itemMaxTime = (1000 * 60 * 60 * 24) * 2, // 2 days
        storeNumberOfItems = 30,
        cache = redisCache,
    } = {}) {
        this.db = db;
        this.cron = cron;
        this.maxConnections = maxConnections;
        this.maxNewItems = maxNewItems;
        this.itemMaxTime = itemMaxTime;
        this.storeNumberOfItems = storeNumberOfItems;
        this.isUpdating = false;
        this.initJob();
        this.cache = cache;
    }

    async getFeedsInfo() {
        return this.db.query.feeds({ where: { activated: true } }, '{ url }');
    }

    async getItems(url) {
        const { items } = await this.db.query.feed({ where: { url } }, '{ items { pubDate guid } }');
        return items;
    }

    /**
     * Delete items that are older than this.itemMaxTime except this.storeNumberOfItems last items
     */
    async deleteOldItems(url) {
        try {
            const lastItem = (await this.db.query.feedItems({
                skip: this.storeNumberOfItems,
                last: 1,
                where: { feed: { url } },
            },
            '{ id }'));
            const lastItemId = lastItem[0] ? lastItem[0].id : null;
            if (lastItemId) {
                const oldItems = {
                    AND: [{ createdAt_lt: new Date(Date.now() - this.itemMaxTime) },
                        { feed: { url } },
                        { id_lte: lastItemId }],
                };
                await this.db.mutation.deleteManyItemEnclosures({
                    where: {
                        item: oldItems,
                    },
                });
                const { count } = await this.db.mutation.deleteManyFeedItems({
                    where: oldItems,
                });
                if (count) { logger.info({ count, url }, 'items were deleted'); }
            }
        } catch (e) {
            logger.error(e);
        }
    }

    async saveFeed(url, newItems) {
        const items = newItems
            .sort((a, b) => a.pubDate - b.pubDate)
            .slice(-this.maxNewItems);
        const query = {
            where: { url },
            data: { items: { create: items } },
        };
        await this.db.mutation.updateFeed(query);
        return items.length;
    }

    async setFeedUpdateTime(url) {
        return this.db.mutation.updateFeed({
            where: { url },
            data: { lastSuccessful: new Date() },
        });
    }

    async updateMeta(url, feedMeta) {
        try {
            const meta = filterMeta(feedMeta);
            await this.db.mutation.updateFeed({
                where: { url },
                data: meta,
            });
        } catch ({ message }) {
            logger.warn({ url, message }, 'meta wasn\'t updated');
        }
    }

    async update() {
        logger.info('Start updating...');
        const feeds = await this.getFeedsInfo();
        const limit = pLimit(this.maxConnections);
        let [totalFeeds, totalNewItems] = [0, 0];
        await Promise.all(feeds.map(({ url }) => limit(async () => this.cache.isLocked(url)
            .then(async (isLocked) => {
                try {
                    if (isLocked) {
                        logger.error({ url }, 'The feed is locked, skip updating');
                        return;
                    }
                    await this.cache.lock(url);
                    /* accumulator += await... -- doesn't work in map because before promise resolves,
                    accumulation value in every function stays 0 */
                    totalNewItems = await this.updateFeed(url) + totalNewItems;
                    await this.setFeedUpdateTime(url);
                    totalFeeds += 1;
                } catch (error) {
                    logger.error({ url, message: error.message }, 'Couldn\'t update a feed');
                }
                await this.cache.unlock(url);
            })
            .catch(e => logger.error(e)) // Catch cache errors
            .then(() => {
                buildAndSendDigests(url);
            }))));
        logger.info({ totalFeeds, totalNewItems }, 'Feeds were updated');
    }

    async updateFeed(url) {
        let newItemsCount = 0;
        const items = await this.getItems(url);
        const { feedItems: newItems, feedMeta } = await getNewItems(url, items, filterAndClearHtml);
        this.updateMeta(url, feedMeta);
        if (newItems.length) {
            newItemsCount = await this.saveFeed(url, newItems);
        }
        this.deleteOldItems(url);
        logger.info({ url, newItems: newItemsCount }, 'A feed was updated');
        return newItemsCount;
    }

    initJob() {
        const jobCallBack = async () => {
            if (this.isUpdating) return;
            this.isUpdating = true;
            try {
                await this.update();
            } catch (e) {
                logger.error({ message: e.message }, 'Error during updating');
            }
            this.isUpdating = false;
        };
        this.job = new CronJob(this.cron, jobCallBack, null, false, 'UTC');
    }

    start() {
        this.job.start();
    }

    cancel() {
        this.job.stop();
        logger.info('Watcher stopped');
    }

    reschedule(spec) {
        this.job.setTime(spec);
    }

    getNextUpdateTime() {
        return this.job.running ? this.job.nextDates() : null;
    }
}

module.exports = Watcher;
