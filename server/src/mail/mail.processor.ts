import { Job } from 'bullmq';
import { logger } from '../logger.js';
import type { SimpleMail } from './mail.interface.js';
import { transport } from './transport.js';

export default async (job: Job<SimpleMail>) => {
  const result = await transport.sendMail(job.data);
  logger.info({ result, subject: job.data.subject }, 'email has been sent');
  return result;
};
