import 'reflect-metadata';
import '../dotenv.js';

import { Queue, Worker } from 'bullmq';
import { IS_TEST } from '../constants.js';
import { initLogFiles, logger } from '../logger.js';
import { createRedis, pubSub, redis } from '../redis.js';
import { getFeedsToUpdate } from './watcher-utils.js';
import config from './watcher.config.js';
import watcherProcessor from './watcher.processor.js';
import { WatcherQueue } from './watcher.queue.js';

export let worker: Worker;
export let queue: Queue;
export let watcherQueue: WatcherQueue;

async function initQueue(clearJobs = true) {
  watcherQueue = new WatcherQueue();
  if (clearJobs) await watcherQueue.clearAllRepeatables();
}

async function createWorkerAndQueue(clearJobs = true) {
  await initQueue(clearJobs);
  worker = new Worker(
    config.queueName, //
    watcherProcessor(watcherQueue, pubSub),
    {
      connection: createRedis({ maxRetriesPerRequest: null, enableReadyCheck: false }),
      concurrency: config.concurrency,
      limiter: config.limiter,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error(err, job?.data, 'job failed');
  });

  worker.on('error', (err) => {
    logger.error(err, 'email worker error');
  });

  queue = new Queue(config.queueName, {
    connection: createRedis({ maxRetriesPerRequest: null, enableReadyCheck: false }),
  });
}

export async function start() {
  initLogFiles({ prefix: 'watcher_', name: 'watcher' });

  await createWorkerAndQueue(true);

  const feeds = await getFeedsToUpdate();

  await Promise.all(feeds.map((f) => watcherQueue.enqueueFeed(f, false)));

  logger.info('Feed watcher worker listening for jobs');

  const exit = async () => {
    await watcherQueue.close();
    await worker.close();
    await queue.close();
    redis.disconnect();
    process.exit();
  };

  // catches ctrl+c event
  process.on('SIGINT', exit);
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exit);
  process.on('SIGUSR2', exit);
}

if (!IS_TEST) {
  start();
}
