import faker from 'faker';
import moment from 'moment';
import { throttleMultiplier } from '../constants';
import { buildAndSendDigests } from '../digests/build-and-send';
import Watcher from './watcher';
import * as watcherUtils from './watcher-utils';

const updateFeedData = watcherUtils.updateFeedData as jest.Mock;
const getFeedsToUpdate = watcherUtils.getFeedsToUpdate as jest.Mock;

jest.mock('./watcher-utils.ts', () => ({
    updateFeedData: jest.fn(async () => [0, 0]),
    getFeedsToUpdate: jest.fn(async () => []),
}));
jest.mock('../digests/build-and-send.ts', () => ({
    buildAndSendDigests: jest.fn(async () => {}),
}));

const realDate = Date.now;
const tsNow = 1600000000000;

beforeAll(() => {
    global.Date.now = jest.fn(() => tsNow); // 2020-09-13T12:26:40.000
});

afterAll(() => {
    global.Date.now = realDate;
});

describe('Feed watcher schedule', () => {
    test("should create watcher's instance that has managing methods", () => {
        const feedWatcher = new Watcher();
        feedWatcher.start();
        expect(moment.isMoment(feedWatcher.getNextUpdateTime())).toBeTruthy();

        feedWatcher.cancel();
        expect(feedWatcher.getNextUpdateTime()).toBeNull();
    });

    // test('should call update every fixed amount of time', async () => {
    //     const feedWatcher = new Watcher({ cron: '*/1 * * * * *' }); // update every second
    //     feedWatcher.update = jest.fn(async () => {});
    //     feedWatcher.start();
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     feedWatcher.cancel();
    //     expect(feedWatcher.update).toHaveBeenCalledTimes(2);
    // });
});

function generatePartialFeeds(num: number, sinceLastUpdateTs = 1000 * 60 * 5) {
    return new Array(num).fill({}).map((_, index) => {
        const ts = new Date(tsNow - sinceLastUpdateTs);
        const feed: watcherUtils.PartialFeed = {
            url: `${faker.internet.url()}/feed.rss`,
            id: index,
            throttled: 0,
            lastSuccessfulUpd: ts,
            lastUpdAttempt: ts,
        };
        return feed;
    });
}

describe('Watcher Update', () => {
    const feedWatcher = new Watcher();
    const feeds = generatePartialFeeds(6, throttleMultiplier + 100);
    feeds[0].throttled = 1;
    feeds[1].throttled = 2;
    feeds[2].throttled = 3;
    getFeedsToUpdate.mockImplementation(async () => feeds);

    test('should call updateFeedData on not throttled feed', async () => {
        await feedWatcher.update();
        expect(getFeedsToUpdate).toHaveBeenCalled();
        expect(updateFeedData).toHaveBeenCalledTimes(4);
        expect(updateFeedData).toHaveBeenCalledWith(feeds[0].url);
        expect(updateFeedData).not.toHaveBeenCalledWith(feeds[1].url);
    });

    test('should call buildAndSendDigests after updating', async () => {
        feeds.forEach(({ id }) => expect(buildAndSendDigests).toHaveBeenCalledWith(id));
    });
});
