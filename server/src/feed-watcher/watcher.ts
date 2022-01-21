import { CronJob, CronTime } from 'cron';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import PQueue from 'p-queue';
import { throttleMultiplier } from '../constants.js';
import { buildAndSendDigests } from '../digests/build-and-send.js';
import { logger } from '../logger.js';
import { createRedis } from '../redis.js';
import { redisOptions } from '../constants.js';
import { NewItemsPayload, PubSubTopics } from '../resolvers/resolver-types/pubSubTopics.js';
import { getFeedsToUpdate, updateFeedData } from './watcher-utils.js';

type WatcherProps = {
  /** Cron Time */
  cron?: string | Date | moment.Moment;
  /** Number of concurrent connections */
  concurrency?: number;
};

export default class Watcher {
  isUpdating: boolean = false;

  cron: string | Date | moment.Moment = '*/5 * * * *';

  job: CronJob;

  queue: PQueue;

  updating = false;

  pubSub: RedisPubSub;

  constructor({ cron = '*/5 * * * *', concurrency = 10 }: WatcherProps = {}) {
    this.cron = cron;
    this.initJob();
    this.queue = new PQueue({ concurrency, timeout: 1000 * 60 });
    this.pubSub = new RedisPubSub({ publisher: createRedis(), connection: redisOptions });
  }

  async update(minAfterPrevUpdate = 4) {
    if (this.updating) return;
    this.updating = true;
    logger.info('Start updating...');

    const newItemsPayload: NewItemsPayload = {};

    const feeds = await getFeedsToUpdate(minAfterPrevUpdate);
    const now = Date.now();
    let [totalFeeds, totalItems] = [0, 0];
    await this.queue.addAll(
      feeds.map(({ id, url, throttled, lastUpdAttempt }) => async () => {
        if (now > throttleMultiplier * throttled + lastUpdAttempt.getTime()) {
          const [isSuccessful, itemsNum] = await updateFeedData(url);
          if (isSuccessful) {
            totalFeeds += 1;
            totalItems += itemsNum;
            if (itemsNum) newItemsPayload[id] = { count: itemsNum };
          }
        }

        return buildAndSendDigests(id);
      }),
    );
    logger.info({ totalFeeds, totalItems }, 'End updating');

    if (totalItems) {
      await this.pubSub.publish(PubSubTopics.newItems, newItemsPayload);
    }

    this.updating = false;
  }

  initJob() {
    const jobCallBack = async () => {
      if (this.isUpdating) return;
      this.isUpdating = true;
      try {
        await this.update();
      } catch (e) {
        logger.error({ message: e.message }, 'Error during updating');
      }
      this.isUpdating = false;
    };

    this.job = new CronJob(this.cron, jobCallBack, null, false, 'UTC');
  }

  start() {
    this.job.start();
    logger.info('Watcher is started');
  }

  async cancel() {
    this.job.stop();
    await this.pubSub.close();
    logger.info('Watcher stopped');
  }

  reschedule(time: CronTime) {
    this.job.setTime(time);
  }

  getNextUpdateTime() {
    return this.job.running ? this.job.nextDates() : null;
  }
}
