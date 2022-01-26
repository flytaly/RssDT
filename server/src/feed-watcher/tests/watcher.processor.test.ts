import test from 'ava';
import { Job } from 'bullmq';
import faker from 'faker';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import sinon from 'sinon';
import '../../dotenv.js';
import { buildAndSendDigestsMock } from '../../digests/build-and-send.js';
import { PubSubTopics } from '../../resolvers/resolver-types/pubSubTopics.js';
import { closeTestConnection, runTestConnection } from '../../tests/test-utils/connection.js';
import { getFeedUpdateInterval, mockWatcherUtils, PartialFeed } from '../watcher-utils.js';
import { UpdateFeed } from '../watcher.interface.js';
import createProcessor from '../watcher.processor.js';
import { WatcherQueue } from '../watcher.queue.js';

test.before(async () => {
  await runTestConnection();
});

test.after(async () => {
  await closeTestConnection();
});

function createPartialFeed({ throttled = 0 } = {}) {
  const ts = new Date(Date.now() - 60000);
  const feed: PartialFeed = {
    url: `${faker.internet.url()}/feed.rss`,
    id: faker.datatype.number(),
    throttled: throttled || 0,
    lastSuccessfulUpd: ts,
    lastUpdAttempt: ts,
  };
  return feed;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const buildAndSendDigestsFake = sinon.fake(async (_: number) => {});
buildAndSendDigestsMock(buildAndSendDigestsFake);

function makeMocks({ throttled = 0 } = {}) {
  const feed = createPartialFeed({ throttled });
  const wq = new WatcherQueue();
  const pubsub = { publish: sinon.fake() };
  const processor = createProcessor(wq, pubsub as unknown as RedisPubSub);
  return { processor, pubsub, wq, feed };
}

function makeJob({ id, url, throttle }: { id: string | number; url: string; throttle: number }) {
  const every = getFeedUpdateInterval(throttle);
  id = String(id);
  const job: Job<UpdateFeed> = {
    id,
    name: 'update-feed',
    data: { id, feedUrl: url },
    opts: { repeat: { every, jobId: id } },
  } as unknown as Job<UpdateFeed>;
  return job;
}

test.serial('update feed fail', async (t) => {
  const { processor, feed } = makeMocks({ throttled: 0 });
  // @ts-ignore
  mockWatcherUtils({ updateFeedDataMock: sinon.fake(async () => [0, 0, feed]) });
  const job = makeJob({ id: feed.id, url: feed.url, throttle: 0 });
  await processor(job);
  t.true(buildAndSendDigestsFake.args.flat().includes(feed.id));
});

test.serial('update feed fail, increase throttled value', async (t) => {
  const { processor, feed, wq } = makeMocks({ throttled: 2 });
  // @ts-ignore
  mockWatcherUtils({ updateFeedDataMock: sinon.fake(async () => [0, 0, feed]) });
  const id = String(feed.id);
  const job = makeJob({ id: feed.id, url: feed.url, throttle: 0 });
  const remove = wq.queue.removeRepeatable as unknown as sinon.SinonSpy;
  const enqueue = wq.queue.add as unknown as sinon.SinonSpy;
  await processor(job);
  t.deepEqual(remove.args, [['update-feed', job.opts.repeat, id]]);
  //
  const nextInterval = getFeedUpdateInterval(2);
  t.deepEqual(enqueue.args, [
    ['update-feed', job.data, { repeat: { jobId: id, every: nextInterval } }],
  ]);
  t.true(buildAndSendDigestsFake.args.flat().includes(feed.id));
});

test.serial('update feed success', async (t) => {
  const { processor, feed, pubsub } = makeMocks({ throttled: 0 });
  // @ts-ignore
  mockWatcherUtils({ updateFeedDataMock: sinon.fake(async () => [1, 12, feed]) });
  const id = String(feed.id);
  const job = makeJob({ id: feed.id, url: feed.url, throttle: 0 });
  await processor(job);
  t.true(pubsub.publish.calledOnceWith(PubSubTopics.newItems, { [id]: { count: 12 } }));
  t.true(buildAndSendDigestsFake.args.flat().includes(feed.id));
});

test.serial('update feed success, decrease throttled value', async (t) => {
  const { processor, feed, wq, pubsub } = makeMocks({ throttled: 2 });
  // @ts-ignore
  mockWatcherUtils({ updateFeedDataMock: sinon.fake(async () => [1, 12, feed]) });
  const id = String(feed.id);
  const job = makeJob({ id: feed.id, url: feed.url, throttle: 6 });
  const remove = wq.queue.removeRepeatable as unknown as sinon.SinonSpy;
  const enqueue = wq.queue.add as unknown as sinon.SinonSpy;
  await processor(job);
  t.deepEqual(remove.args, [['update-feed', job.opts.repeat, id]]);
  t.true(pubsub.publish.calledOnceWith(PubSubTopics.newItems, { [id]: { count: 12 } }));
  const nextInterval = getFeedUpdateInterval(2);
  t.deepEqual(enqueue.args, [
    ['update-feed', job.data, { repeat: { jobId: id, every: nextInterval } }],
  ]);
  t.true(buildAndSendDigestsFake.args.flat().includes(feed.id));
});
