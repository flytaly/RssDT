import type { WorkerOptions } from 'bullmq';

const workerOptions: Partial<WorkerOptions> = {
  concurrency: 6,
  limiter: {
    max: 12,
    duration: 1000,
  },
};

export default {
  queueName: 'watcherQueue',
  ...workerOptions,
} as const;
