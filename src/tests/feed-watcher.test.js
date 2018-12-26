/* eslint-env jest */

const { getNewItems } = require('../feed-parser/parse-utils');
const Watcher = require('../feed-watcher');
const mocks = require('./mocks/feed-watcher.mocks');

jest.mock('../feed-parser/parse-utils', () => ({
    getNewItems: jest.fn(() => ({ feedItems: mocks.newFeedItems, feedMeta: null })),
}));

const db = {
    query: {
        feeds: jest.fn(async () => [mocks.feed]),
        feed: jest.fn(async () => ({ items: mocks.oldFeedItems })),
        feedItems: jest.fn(async () => [{ id: mocks.id }]),
    },
    mutation: {
        updateFeed: jest.fn(async () => null),
        deleteManyItemEnclosures: jest.fn(async () => ({ count: 1 })),
        deleteManyFeedItems: jest.fn(async () => ({ count: 1 })),
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
        const feedWatcher = new Watcher(db, { cron: '*/1 * * * * *' }); // update every second
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
        expect(getNewItems).toHaveBeenCalledWith(mocks.feed.url, mocks.oldFeedItems, Watcher.filterFields);
        expect(db.mutation.updateFeed).toHaveBeenCalledWith({
            where: { url: mocks.feed.url },
            data: { items: { create: mocks.newFeedItems } },
        });
    });

    test('should delete old items', () => {
        const feedWatcher = new Watcher(db);
        feedWatcher.deleteOldItems(mocks.feed.url);

        expect(db.mutation.deleteManyItemEnclosures).toHaveBeenCalled();
        expect(db.mutation.deleteManyFeedItems).toHaveBeenCalled();
    });
});

describe('Feed watcher: filterFields method', () => {
    const { filterFields } = Watcher;

    test('should return object with necessary fields', () => {
        const item = {
            ...mocks.item,
            needless: 'Unnecessary field',
            image: mocks.itemImage,
        };
        const resultItem = {
            ...mocks.item,
            imageUrl: mocks.itemImage.url,
        };
        expect(filterFields(item)).toEqual(resultItem);
    });

    test('should return object with enclosures', () => {
        const item = {
            ...mocks.item,
            image: mocks.itemImage,
            enclosures: mocks.enclosures,
        };
        const resultItem = {
            ...mocks.item,
            imageUrl: mocks.itemImage.url,
            enclosures: {
                create: mocks.enclosures,
            },
        };
        expect(filterFields(item)).toEqual(resultItem);
    });
});
