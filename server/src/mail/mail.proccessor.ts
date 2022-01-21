import { Job } from 'bullmq';
import './mail.initialize.js';
// -------------
import { logger } from '../logger.js';
import type { SimpleMail } from './mail.interface';
import { transport } from './transport.js';

export default async (job: Job<SimpleMail>) => {
  const result = await transport.sendMail(job.data);
  logger.info({ result, subject: job.data.subject }, 'email has been sent');
  return result;
};
