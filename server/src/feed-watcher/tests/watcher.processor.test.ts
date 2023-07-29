/* eslint-disable @typescript-eslint/no-unused-vars */
import '#root/dotenv.js';
import 'reflect-metadata';

import { Feed } from '#root/db/schema';
import { buildAndSendDigestsMock } from '#root/digests/build-and-send.js';
import {
  PartialFeed,
  Status,
  getFeedUpdateInterval,
  mockWatcherUtils,
} from '#root/feed-watcher/watcher-utils.js';
import { UpdateFeed } from '#root/feed-watcher/watcher.interface.js';
import createProcessor from '#root/feed-watcher/watcher.processor.js';
import { WatcherQueue } from '#root/feed-watcher/watcher.queue.js';
import { PubSubTopics } from '#root/resolvers/resolver-types/pubSubTopics.js';
import test from 'ava';
import { Job } from 'bullmq';
import faker from 'faker';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import sinon from 'sinon';

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

function mockUpdateResult(status: Status, newItemsNum: number, feed: PartialFeed) {
  mockWatcherUtils({
    updateFeedDataMock: sinon.fake(
      async (url: string, skipRecent = false) => [status, newItemsNum, feed as Feed] as const,
    ),
  });
}

test('update feed fail', async (t) => {
  const { processor, feed } = makeMocks({ throttled: 0 });
  mockUpdateResult(Status.Fail, 0, feed);
  const job = makeJob({ id: feed.id, url: feed.url, throttle: 0 });
  await processor(job);
  t.true(buildAndSendDigestsFake.args.flat().includes(feed.id));
});

test('update feed fail, increase throttled value', async (t) => {
  const { processor, feed, wq } = makeMocks({ throttled: 2 });
  mockUpdateResult(Status.Fail, 0, feed);
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

test('update feed success', async (t) => {
  const { processor, feed, pubsub } = makeMocks({ throttled: 0 });
  const count = 12;
  mockUpdateResult(Status.Success, count, feed);
  const id = String(feed.id);
  const job = makeJob({ id: feed.id, url: feed.url, throttle: 0 });
  await processor(job);
  t.true(pubsub.publish.calledOnceWith(PubSubTopics.newItems, { [id]: { count } }));
  t.true(buildAndSendDigestsFake.args.flat().includes(feed.id));
});

test('update feed success, decrease throttled value', async (t) => {
  const { processor, feed, wq, pubsub } = makeMocks({ throttled: 2 });
  const count = 12;
  mockUpdateResult(Status.Success, count, feed);
  const id = String(feed.id);
  const job = makeJob({ id: feed.id, url: feed.url, throttle: 6 });
  const remove = wq.queue.removeRepeatable as unknown as sinon.SinonSpy;
  const enqueue = wq.queue.add as unknown as sinon.SinonSpy;
  await processor(job);
  t.deepEqual(remove.args, [['update-feed', job.opts.repeat, id]]);
  t.true(pubsub.publish.calledOnceWith(PubSubTopics.newItems, { [id]: { count } }));
  const nextInterval = getFeedUpdateInterval(2);
  t.deepEqual(enqueue.args, [
    ['update-feed', job.data, { repeat: { jobId: id, every: nextInterval } }],
  ]);
  t.true(buildAndSendDigestsFake.args.flat().includes(feed.id));
});
