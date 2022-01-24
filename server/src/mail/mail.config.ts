import type { WorkerOptions } from 'bullmq';
import { redisOptions } from '../constants.js';

const workerOptions: Partial<WorkerOptions> = {
  concurrency: 4,
  connection: redisOptions,
  limiter: {
    max: 4,
    duration: 1000,
  },
};

export default {
  queueName: 'mailQueue',
  ...workerOptions,
} as const;
