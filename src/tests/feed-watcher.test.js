/* eslint-env jest */

const { getNewItems } = require('../feed-parser/parse-utils');
const Watcher = require('../feed-watcher');
const mocks = require('./mocks/graphql_mocks');

jest.mock('../feed-parser/parse-utils', () => ({
    getNewItems: jest.fn(() => mocks.newFeedItems),
}));

const db = {
    query: {
        feeds: jest.fn(async () => [mocks.feed]),
        feed: jest.fn(async () => ({ items: mocks.oldFeedItems })),
    },
    mutation: {
        updateFeed: jest.fn(async () => null),
    },
};

beforeEach(() => {
    jest.resetModules();
});

describe('Feed watcher', () => {
    test('should create watcher\'s instance that has managing methods', () => {
        const feedWatcher = new Watcher(db);
        feedWatcher.start();
        expect(typeof feedWatcher.getNextUpdateTime().getTime() === 'number').toBeTruthy();
        feedWatcher.cancel();
        expect(feedWatcher.getNextUpdateTime()).toBeNull();
    });

    test('should call update every fixed amount of time', async () => {
        const feedWatcher = new Watcher(db, '*/1 * * * * *'); // update every second
        feedWatcher.update = jest.fn();
        feedWatcher.start();
        await new Promise(resolve => setTimeout(resolve, 2010));
        feedWatcher.cancel();
        expect(feedWatcher.update).toHaveBeenCalledTimes(2);
    });

    test('should update feed with new items', async () => {
        const feedWatcher = new Watcher(db);
        await feedWatcher.update();
        expect(db.query.feeds).toHaveBeenCalled();
        expect(db.query.feed).toHaveBeenCalledWith(
            { where: { url: mocks.feed.url } },
            '{ items { pubDate guid } }',
        );
        expect(getNewItems).toHaveBeenCalledWith(mocks.feed.url, mocks.oldFeedItems);
        expect(db.mutation.updateFeed).toHaveBeenCalledWith({
            where: { url: mocks.feed.url },
            data: { items: { create: mocks.newFeedItems } },
        });
    });
});
