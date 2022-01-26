import type { JobsOptions, QueueOptions } from 'bullmq';
import { BulkJobOptions, Queue, RepeatOptions } from 'bullmq';
import sinon from 'sinon';
import { IS_DEV, IS_TEST } from '../constants.js';
import { logger } from '../logger.js';
import { createRedis } from '../redis.js';
import { getFeedUpdateInterval } from './watcher-utils.js';
import config from './watcher.config.js';
import { UpdateFeed } from './watcher.interface.js';

const createFakeQ = () =>
  ({
    add: sinon.fake(),
    removeRepeatable: sinon.fake(),
    removeRepeatableByKey: sinon.fake(),
    getRepeatableJobs: sinon.fake(async () => []),
  } as unknown as Queue);

export class WatcherQueue {
  queue: Queue;

  constructor(opts: QueueOptions = {}) {
    if (IS_TEST) {
      this.queue = createFakeQ();
      return;
    }

    const connection = opts?.connection
      ? opts.connection
      : createRedis({ maxRetriesPerRequest: null, enableReadyCheck: false });

    this.queue = new Queue<UpdateFeed>(config.queueName, {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
      ...opts,
      connection,
    });
  }

  async enqueue(jobName: string, data: UpdateFeed, jobOpts?: JobsOptions) {
    await this.queue.add(jobName, data, jobOpts);
  }

  async enqueueFeed(feed: { id: number | string; url: string; throttled: number }, log = true) {
    const id = String(feed.id);
    if (log) logger.info({ url: feed.url }, 'Enqueue feed');
    return this.enqueue(
      'update-feed',
      { id, feedUrl: feed.url },
      {
        repeat: {
          jobId: id,
          every: getFeedUpdateInterval(feed.throttled),
          immediately: IS_DEV || undefined,
        },
      },
    );
  }

  async addBulk(
    jobs: {
      name: string;
      data: UpdateFeed;
      opts?: BulkJobOptions;
    }[] = [],
  ) {
    await this.queue.addBulk(jobs);

    logger.info(`Enqueued ${jobs.length} feeds`);
  }

  async removeRepeatable(name: string, opts: RepeatOptions, jobId?: string) {
    this.queue.removeRepeatable(name, opts, jobId);
  }

  async clearAllRepeatables() {
    const jobs = await this.queue.getRepeatableJobs();
    return Promise.all(jobs.map((j) => this.queue.removeRepeatableByKey(j.key)));
  }

  close() {
    return this.queue.close();
  }
}
