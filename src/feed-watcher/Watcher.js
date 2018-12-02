const schedule = require('node-schedule');
const pLimit = require('p-limit');
const pick = require('lodash.pick');
const logger = require('../logger');
const { getNewItems } = require('../feed-parser');

class Watcher {
    /**
     * @param {object} db - connection to Prisma Binding
     * @param {string} cron - update schedule time in cron format
     * @param {number} maxConnections - maximum number of concurrent connection
     */
    constructor(db, cron = '*/1 * * * *', maxConnections = 40) {
        this.db = db;
        this.maxConnections = maxConnections;
        this.cron = cron;
    }

    async getFeedsInfo() {
        return this.db.query.feeds({}, '{ url }');
    }

    async getItems(url) {
        const { items } = await this.db.query.feed({ where: { url } }, '{ items { pubDate guid } }');
        return items;
    }

    async saveFeed(url, newItems) {
        // TODO: Limit number of items in DB
        const items = Watcher.filterFields(newItems);
        const query = {
            where: { url },
            data: { items: { create: items } },
        };
        return this.db.mutation.updateFeed(query);
    }

    async update() {
        const feeds = await this.getFeedsInfo();
        const limit = pLimit(this.maxConnections);
        const processFeeds = feeds.map(({ url }) => limit(async () => {
            try {
                const items = await this.getItems(url);

                const newItems = await getNewItems(url, items);

                if (newItems.length) await this.saveFeed(url, newItems);
                logger.info({ url, newItemsNumber: newItems.length }, 'A feed was updated');
            } catch (error) {
                logger.error({ url, message: error.message }, 'Couldn\'t update a feed');
            }
        }));
        await Promise.all(processFeeds);
        logger.info('Feeds were updated');
    }

    start() {
        this.job = schedule.scheduleJob(this.cron, () => this.update());
    }

    cancel() {
        this.job.cancel();
        logger.info('Watcher stopped');
    }

    reschedule(spec) {
        this.job.reschedule(spec);
    }

    getNextUpdateTime() {
        return this.job.nextInvocation();
    }

    static filterFields(items) {
        // TODO: save images and enclosures

        const fields = ['title', 'description', 'summary', 'pubDate', 'link', 'guid'];

        return items
            .map((item) => {
                const obj = pick(item, fields);
                return obj;
            })
            .sort((a, b) => a.pubDate - b.pubDate);
    }
}

module.exports = Watcher;
