import PQueue from 'p-queue';
// eslint-disable-next-line import/extensions
import { Feed, UserFeed } from '#entities';
import { IS_TEST, maxItemsInDigest, scheduleHours } from '../constants.js';
import { logger } from '../logger.js';
import { composeDigest } from './compose-mail.js';
import { composeEmailSubject } from './compose-subject.js';
import { isFeedReady } from './is-feed-ready.js';
import { getItemsNewerThan, userFeedsWithDigests } from './query-helpers.js';
import { transport } from '../mail/transport.js';

const queueOpts = IS_TEST ? {} : { concurrency: 5, interval: 1000, intervalCap: 10 };
const digestQueue = new PQueue(queueOpts);

const hour = 1000 * 60 * 60;
const getPeriod = (uf: UserFeed) => {
  const now = Date.now();
  let timeMS = uf.lastDigestSentAt?.getTime() || uf.lastViewedItemDate?.getTime() || 0;
  if (!timeMS) timeMS = now - (scheduleHours[uf.schedule] + 1) * hour;
  return new Date(Math.max(timeMS, now - hour * 48));
};

export let buildAndSendDigests = async (feedId: number) => {
  const userFeeds = await userFeedsWithDigests(feedId);
  const readyUFs = userFeeds.filter(isFeedReady);
  if (!readyUFs.length) return;
  const feed = await Feed.findOneOrFail(feedId);
  await digestQueue.addAll(
    readyUFs.map((uf) => async () => {
      try {
        const timestamp = new Date();
        const items = await getItemsNewerThan(feedId, getPeriod(uf), {
          limit: maxItemsInDigest,
          usePubDate: !uf.lastDigestSentAt,
          filter: uf.filter,
        });
        if (!items.length) return;
        const { text, html, errors } = composeDigest(uf, feed, items);
        if (!errors?.length) {
          const { customSubject } = uf.user.options;
          const result = await transport.sendMail({
            from: process.env.MAIL_FROM,
            to: uf.user.email,
            subject: composeEmailSubject(
              uf.title || feed.title || feed.link || feed.url,
              uf.schedule,
              customSubject,
            ),
            text,
            html,
          });
          logger.info(result, 'digest email has been sent');
          uf.lastDigestSentAt = timestamp;
          await uf.save();
        } else {
          logger.error(errors);
        }
      } catch (error) {
        logger.error(error);
      }
    }),
  );
};

export const buildAndSendDigestsMock = (mock: typeof buildAndSendDigests) => {
  buildAndSendDigests = mock;
};
