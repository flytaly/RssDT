import { Queue, Worker } from 'bullmq';
import '../dotenv.js';
import { initLogFiles, logger } from '../logger.js';
import { createRedis } from '../redis.js';
import config from './mail.config.js';
import mailProcessor from './mail.processor.js';

export let worker: Worker;
export let queue: Queue;

function createWorker() {
  worker = new Worker(
    config.queueName, //
    mailProcessor,
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
  initLogFiles({ prefix: 'mail_', name: 'mail' });

  createWorker();

  logger.info('Mail worker listening for jobs');

  const exit = async () => {
    await worker.close();
    await queue.close();
    process.exit();
  };

  // catches ctrl+c event
  process.on('SIGINT', exit);
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exit);
  process.on('SIGUSR2', exit);
}

start();
