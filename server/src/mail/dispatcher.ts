import PQueue from 'p-queue';
import { Not } from 'typeorm';
import { Feed } from '../entities/Feed';
import { UserFeed } from '../entities/UserFeed';
import { logger } from '../logger';
import { DigestSchedule } from '../types/enums';
import { digestNames } from './digest-names';
import { isFeedReady } from './is-feed-ready';
import { transport } from './transport';

const digestQueue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 10 });
const emailQueue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 20 });

export const filterReadyUserFeeds = (userFeeds: UserFeed[] = []) => userFeeds.filter(isFeedReady);

const userFeedsWithDigests = async (feedId: number) => {
    // ? Maybe 1 request with feed relation would be better, not sure.
    //  At least, this way there is single feed object instead of multiple copies
    return Promise.all([
        UserFeed.find({
            where: { feedId, activated: true, schedule: Not(DigestSchedule.disable) },
            loadEagerRelations: true,
            relations: ['user'],
        }),
        Feed.findOne(feedId),
    ]);
};

export const buildAndSendDigests = (feedId: number) =>
    digestQueue.add(async () => {
        const [userFeeds, feed] = await userFeedsWithDigests(feedId);
        const readyUF = filterReadyUserFeeds(userFeeds);
        if (!readyUF.length) return;

        // TODO: select items that newer than lastDigestSentAt and! newer than "current time - schedule duration".
        // TODO: BUILD AND SEND
    });

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
    title: string;
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
                ? `(${digestNames[digestType]})`
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
