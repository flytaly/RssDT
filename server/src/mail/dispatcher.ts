import PQueue from 'p-queue';
import { IS_TEST } from '../constants.js';
import { logger } from '../logger.js';
import { DigestSchedule } from '../types/enums.js';
import { digestNames } from '../digests/digest-names.js';
import { transport } from './transport.js';

const queueOpts = IS_TEST ? {} : { concurrency: 5, interval: 1000, intervalCap: 10 };
const emailQueue = new PQueue(queueOpts);

export const sendConfirmEmail = async (email: string, token: string, userId: number) =>
  emailQueue.add(async () => {
    const url = `${process.env.FRONTEND_URL}/confirm-register?token=${token}&id=${userId}`;
    const result = await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Confirm registration`,
      text: `Please, confirm registration: ${url}.
        Ignore this message if you didn't register`,
      html: `Please, confirm registration: <a href="${url}">${url}</a><br><br>
        Ignore this message if you didn't register`,
    });
    logger.info(result, 'registration confirmation email has been sent');
  });

export const sendPasswordReset = async (email: string, token: string, userId: number) =>
  emailQueue.add(async () => {
    const url = `${process.env.FRONTEND_URL}/reset?token=${token}&id=${userId}`;
    const result = await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Reset password',
      text: `A password reset has been requested.

If it was you, visit this link to reset your password: ${url}

Otherwise, ignore this message.`,
      html: `A password reset has been requested.<br>
        If it was you, visit this link to reset your password: <a href="${url}">${url}</a><br><br>
        Otherwise, ignore this message.`,
    });
    logger.info(result, 'rest password email has been sent');
  });

export interface ConfirmFeedProps {
  email: string;
  token: string;
  userFeedId: number;
  title?: string;
  digestType: DigestSchedule;
}

/** Send an email to confirm subscription */
export const sendConfirmSubscription = ({
  email,
  token,
  userFeedId,
  title,
  digestType,
}: ConfirmFeedProps) =>
  emailQueue.add(async () => {
    const digestString =
      digestType && digestType !== DigestSchedule.disable
        ? `(${digestNames[digestType]} digest)`
        : '';
    const url = `${process.env.FRONTEND_URL}/confirm?token=${token}&id=${userFeedId}`;
    const result = await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `Confirm subscription to ${title}`,
      text: `Please, confirm subscription to ${title} ${digestString}:
        ${url}

        Ignore this message if you didn't subscribe`,
      html: `Please, confirm subscription to <b>${title}</b> ${digestString}: <br>
        <a href="${url}">${url}</a><br><br>
        Ignore this message if you didn't subscribe`,
    });
    logger.info(result, 'feed confirmation email has been sent');
  });

export const sendFeedback = async (email: string, text: string) =>
  emailQueue.add(async () => {
    const result = await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_FEEDBACK_TO,
      subject: `Feedback from ${email}`,
      text: `${email} sent feedback.
      Text:
      ${text}`,
    });
    logger.info(result, 'feedback email has been sent');
  });
