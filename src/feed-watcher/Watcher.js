const schedule = require('node-schedule');
const pLimit = require('p-limit');
const pick = require('lodash.pick');
const { getNewItems } = require('../feed-parser/parse-utils');

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

        return this.db.mutation.updateFeed({
            where: { url },
            data: { items: { create: items } },
        });
    }

    async update() {
        const feeds = await this.getFeedsInfo();
        const limit = pLimit(this.maxConnections);
        const processFeeds = feeds.map(({ url }) => limit(async () => {
            try {
                const items = await this.getItems(url);

                const newItems = await getNewItems(url, items);
                await this.saveFeed(url, newItems);
                console.log(`${new Date().toUTCString()}: ${url} was updated. Saved ${newItems.length} new items`);
            } catch (error) {
                console.error(`${new Date().toUTCString()}: Couldn't update ${url}. Error: ${error.message}`);
            }
        }));
        await Promise.all(processFeeds);
        console.log(`${new Date().toUTCString()}: Feeds were updated.`);
    }

    start() {
        this.job = schedule.scheduleJob(this.cron, () => {
            this.update();
        });
    }

    cancel() {
        this.job.cancel();
        console.log('job stopped');
    }

    reschedule(spec) {
        this.job.reschedule(spec);
    }

    getNextUpdateTime() {
        return this.job.nextInvocation();
    }

    static filterFields(items) {
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
