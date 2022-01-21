import { QueueScheduler, Worker } from 'bullmq';
import './mail.initialize.js';
import { logger } from '../logger.js';
import config from './config.js';
import { createRedis } from '../redis.js';

export const worker = new Worker(
  config.queueName, //
  __dirname + '/mail.proccessor.js',
  {
    connection: createRedis({ maxRetriesPerRequest: null }),
    concurrency: config.concurrency,
    limiter: config.limiter,
  },
);

worker.on('failed', (job, err) => {
  logger.error(err, job.data, 'job failed');
});

worker.on('error', (err) => {
  logger.error(err, 'email worker error');
});

export const scheduler = new QueueScheduler(config.queueName, {
  connection: config.connection,
});

logger.info('Mail worker listening for jobs');
