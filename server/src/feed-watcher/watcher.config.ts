import type { WorkerOptions } from 'bullmq';
import { redisOptions } from '../constants.js';

const workerOptions: Partial<WorkerOptions> = {
  concurrency: 6,
  connection: redisOptions,
  limiter: {
    max: 12,
    duration: 1000,
  },
};

export default {
  queueName: 'watcherQueue',
  ...workerOptions,
} as const;
