import faker from 'faker';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import moment from 'moment';
import { throttleMultiplier } from '../constants';
import { buildAndSendDigests } from '../digests/build-and-send';
import { createRedis } from '../redis';
import { NewItemsPayload, PubSubTopics } from '../resolvers/common/pubSubTopics';
import Watcher from './watcher';
import * as watcherUtils from './watcher-utils';

const updateFeedData = watcherUtils.updateFeedData as jest.Mock;
const getFeedsToUpdate = watcherUtils.getFeedsToUpdate as jest.Mock;

jest.mock('./watcher-utils.ts', () => ({
  updateFeedData: jest.fn(async () => []),
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
  test("should create watcher's instance that has managing methods", async () => {
    const feedWatcher = new Watcher();
    feedWatcher.start();
    expect(moment.isMoment(feedWatcher.getNextUpdateTime())).toBeTruthy();

    await feedWatcher.cancel();
    expect(feedWatcher.getNextUpdateTime()).toBeNull();
  });
});

function generatePartialFeeds(num: number, sinceLastUpdateTs = 1000 * 60 * 5) {
  return new Array(num).fill({}).map((_, index) => {
    const ts = new Date(tsNow - sinceLastUpdateTs);
    const feed: watcherUtils.PartialFeed = {
      url: `${faker.internet.url()}/feed.rss`,
      id: index + 1,
      throttled: 0,
      lastSuccessfulUpd: ts,
      lastUpdAttempt: ts,
    };
    return feed;
  });
}

describe('Watcher Update', () => {
  const pubsub = new RedisPubSub({ subscriber: createRedis() });
  const feedWatcher = new Watcher();
  const feeds = generatePartialFeeds(6, throttleMultiplier + 100);

  beforeAll(() => {
    getFeedsToUpdate.mockImplementation(async () => feeds);
    updateFeedData.mockImplementation(async () => [true, 22]);
  });

  afterAll(async () => {
    await feedWatcher.cancel();
    await pubsub.close();
  });
  test('should call updateFeedData on not throttled feed', async () => {
    feeds[0].throttled = 1;
    feeds[1].throttled = 2;
    feeds[2].throttled = 3;

    await feedWatcher.update();
    expect(getFeedsToUpdate).toHaveBeenCalled();
    expect(updateFeedData).toHaveBeenCalledTimes(4);
    expect(updateFeedData).toHaveBeenCalledWith(feeds[0].url);
    expect(updateFeedData).not.toHaveBeenCalledWith(feeds[1].url);

    feeds.forEach((f) => {
      f.throttled = 0;
    });
  });

  test('should call buildAndSendDigests after updating', async () => {
    feeds.forEach(({ id }) => expect(buildAndSendDigests).toHaveBeenCalledWith(id));
  });

  test('should notify about new items', async (done) => {
    await pubsub.subscribe(PubSubTopics.newItems, (payload: NewItemsPayload) => {
      expect(payload).not.toHaveProperty('1');
      expect(payload).toMatchObject(
        feeds.slice(1).reduce((prev, f) => ({ ...prev, [f.id]: { count: f.id - 1 } }), {}),
      );
      done();
    });

    let newItems = 0;
    updateFeedData.mockImplementation(async () => [true, newItems++]);

    await feedWatcher.update();
  });
});
