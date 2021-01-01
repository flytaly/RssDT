import PQueue, * as pq from 'p-queue';
import PriorityQueue from 'p-queue/dist/priority-queue';
import { IS_TEST, maxItemsInDigest } from '../constants';
import { Feed } from '../entities/Feed';
import { UserFeed } from '../entities/UserFeed';
import { logger } from '../logger';
import { DigestSchedule } from '../types/enums';
import { composeDigest } from './compose-mail';
import { digestNames } from './digest-names';
import { isFeedReady } from './is-feed-ready';
import { getItemsNewerThan, userFeedsWithDigests } from './query-helpers';
import { transport } from './transport';

const queueOpts = IS_TEST ? {} : { concurrency: 5, interval: 1000, intervalCap: 10 };
const digestQueue = new PQueue(queueOpts);
const emailQueue = new PQueue(queueOpts);

const hour = 1000 * 60 * 60;
const getPeriod = (uf: UserFeed) => {
    return new Date(Math.max(uf.lastDigestSentAt.getTime(), Date.now() - hour * 48));
};

export const buildAndSendDigests = async (feedId: number) => {
    const userFeeds = await userFeedsWithDigests(feedId);
    const readyUFs = userFeeds.filter(isFeedReady);
    if (!readyUFs.length) return;
    const feed = await Feed.findOneOrFail(feedId);
    await digestQueue.addAll(
        readyUFs.map((uf) => async () => {
            const items = await getItemsNewerThan(feedId, getPeriod(uf), maxItemsInDigest);
            if (!items.length) return;
            const { text, html, errors } = composeDigest(uf, feed, items);
            if (!errors?.length) {
                const result = await transport.sendMail({
                    from: process.env.MAIL_FROM,
                    to: uf.user.email,
                    // TODO:
                    subject: 'TODO: make subject',
                    text,
                    html,
                });
                logger.info(result, 'digest email has been sent');
            }
        }),
    );
};

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
