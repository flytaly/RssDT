import type { WorkerOptions } from 'bullmq';

const workerOptions: Partial<WorkerOptions> = {
  concurrency: 4,
  limiter: {
    max: 4,
    duration: 1000,
  },
};

export default {
  queueName: 'mailQueue',
  ...workerOptions,
} as const;
