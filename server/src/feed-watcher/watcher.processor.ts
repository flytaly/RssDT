import { Job } from 'bullmq';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { buildAndSendDigests } from '../digests/build-and-send.js';
import { PubSubTopics } from '../resolvers/resolver-types/pubSubTopics.js';
import { getFeedUpdateInterval, Status, updateFeedData } from './watcher-utils.js';
import { UpdateFeed } from './watcher.interface.js';
import { WatcherQueue } from './watcher.queue.js';

export default (watcherQueue: WatcherQueue, pubSub: RedisPubSub) => async (job: Job<UpdateFeed>) => {
  const { id, feedUrl } = job.data;

  const [status, newItemsCount, feed] = await updateFeedData(feedUrl, true);
  /** Decrease or increase update interval if necessary based on `throttled` value **/
  if (feed) {
    const nextInterval = getFeedUpdateInterval(feed.throttled || 0);
    if (job.opts.repeat?.every !== nextInterval) {
      await watcherQueue.removeRepeatable(job.name, { ...job.opts.repeat }, id);
      await watcherQueue.enqueue('update-feed', job.data, {
        ...job.opts,
        repeat: { ...job.opts.repeat, every: nextInterval },
      });
    }
  }

  if (status === Status.Success) {
    if (newItemsCount) {
      await pubSub.publish(PubSubTopics.newItems, { [id]: { count: newItemsCount } });
    }
  }

  await buildAndSendDigests(parseInt(id));
};
