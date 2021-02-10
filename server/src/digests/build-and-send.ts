import PQueue from 'p-queue';
import { IS_TEST, maxItemsInDigest, scheduleHours } from '../constants';
import { Feed } from '../entities/Feed';
import { UserFeed } from '../entities/UserFeed';
import { logger } from '../logger';
import { composeDigest } from './compose-mail';
import { composeEmailSubject } from './compose-subject';
import { isFeedReady } from './is-feed-ready';
import { getItemsNewerThan, userFeedsWithDigests } from './query-helpers';
import { transport } from '../mail/transport';

const queueOpts = IS_TEST ? {} : { concurrency: 5, interval: 1000, intervalCap: 10 };
const digestQueue = new PQueue(queueOpts);

const hour = 1000 * 60 * 60;
const getPeriod = (uf: UserFeed) => {
  const now = Date.now();
  let timeMS = uf.lastDigestSentAt?.getTime() || uf.lastViewedItemDate?.getTime() || 0;
  if (!timeMS) timeMS = now - (scheduleHours[uf.schedule] + 1) * hour;
  return new Date(Math.max(timeMS, now - hour * 48));
};

export const buildAndSendDigests = async (feedId: number) => {
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
        });
        if (!items.length) return;
        const { text, html, errors } = composeDigest(uf, feed, items);
        if (!errors?.length) {
          const { customSubject } = uf.user.options;
          const result = await transport.sendMail({
            from: process.env.MAIL_FROM,
            to: uf.user.email,
            subject: composeEmailSubject(feed.title, uf.schedule, customSubject),
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
