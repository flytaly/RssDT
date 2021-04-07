import test from 'ava';
import faker from 'faker';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import moment from 'moment';
import sinon from 'sinon';
import '../../dotenv.js';
import { throttleMultiplier } from '../../constants.js';
import { buildAndSendDigestsMock } from '../../digests/build-and-send.js';
import { createRedis } from '../../redis.js';
import { NewItemsPayload, PubSubTopics } from '../../resolvers/resolver-types/pubSubTopics.js';
import { closeTestConnection, runTestConnection } from '../../tests/test-utils/connection.js';
import { mockWatcherUtils, PartialFeed } from '../watcher-utils.js';
import Watcher from '../watcher.js';

const tsNow = 1600000000000;
let clock: ReturnType<typeof sinon.useFakeTimers>;
test.before(async () => {
  await runTestConnection();
  clock = sinon.useFakeTimers(new Date(tsNow)); // 2020-09-13T12:26:40.000
});

test.after(async () => {
  clock.restore();
  await closeTestConnection();
});

function generatePartialFeeds(num: number, sinceLastUpdateTs = 1000 * 60 * 5) {
  return new Array(num).fill({}).map((_, index) => {
    const ts = new Date(tsNow - sinceLastUpdateTs);
    const feed: PartialFeed = {
      url: `${faker.internet.url()}/feed.rss`,
      id: index + 1,
      throttled: 0,
      lastSuccessfulUpd: ts,
      lastUpdAttempt: ts,
    };
    return feed;
  });
}
const feeds = generatePartialFeeds(6, throttleMultiplier + 100);
const getFeedsToUpdateFake = sinon.fake(async () => feeds);
const updateFeedDataFake = sinon.fake(async () => [true, 1]);
const buildAndSendDigestsFake = sinon.fake(async () => {});

mockWatcherUtils({
  getFeedsToUpdateMock: getFeedsToUpdateFake,
  updateFeedDataMock: updateFeedDataFake,
});
buildAndSendDigestsMock(buildAndSendDigestsFake);

test.serial("create watcher's instance that has managing methods", async (t) => {
  const feedWatcher = new Watcher();
  feedWatcher.start();
  t.truthy(moment.isMoment(feedWatcher.getNextUpdateTime()));
  await feedWatcher.cancel();
  t.falsy(feedWatcher.getNextUpdateTime());
});

test.serial('should call updateFeedData on not throttled feed', async (t) => {
  feeds[0].throttled = 1;
  feeds[1].throttled = 2;
  feeds[2].throttled = 3;
  const feedWatcher = new Watcher();
  await feedWatcher.update();
  await feedWatcher.cancel();
  t.is(getFeedsToUpdateFake.callCount, 1);
  t.is(updateFeedDataFake.callCount, 4);
  feeds.forEach((f) => {
    t.is(updateFeedDataFake.calledWith(f.url), f.throttled < 2);
    f.throttled = 0;
  });
});

test.serial('should call buildAndSendDigests after updating', (t) => {
  feeds.forEach(({ id }) => t.true(buildAndSendDigestsFake.calledWith(id)));
});

test.serial('should notify about new items', async (t) => {
  const pubsub = new RedisPubSub({ subscriber: createRedis() });

  await pubsub.subscribe(PubSubTopics.newItems, (payload: NewItemsPayload) => {
    t.falsy(payload[1]);
    const expected = feeds
      .slice(1)
      .reduce((prev, f) => ({ ...prev, [f.id]: { count: f.id - 1 } }), {});
    t.like(payload, expected);
  });

  let newItems = 0;
  mockWatcherUtils({
    updateFeedDataMock: sinon.fake(async () => [true, newItems++]), // skip first item
  });

  const feedWatcher = new Watcher();
  await feedWatcher.update();
  await feedWatcher.cancel();
  await pubsub.close();
});
