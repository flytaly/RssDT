import { IS_TEST, maxItemsInDigest, scheduleHours } from '#root/constants.js';
import { db } from '#root/db/db.js';
import {
  Feed,
  feeds,
  ItemWithEnclosures,
  UserFeed,
  userFeeds,
  UserFeedWithOpts,
} from '#root/db/schema.js';
import { logger } from '#root/logger.js';
import { transport } from '#root/mail/transport.js';
import { eq } from 'drizzle-orm';
import PQueue from 'p-queue';
import { composeDigest } from './compose-mail.js';
import { composeEmailSubject } from './compose-subject.js';
import { isFeedReady } from './is-feed-ready.js';
import { getItemsNewerThan, userFeedsWithDigests } from './query-helpers.js';

const queueOpts = IS_TEST ? {} : { concurrency: 5, interval: 1000, intervalCap: 10 };
const digestQueue = new PQueue(queueOpts);

const hour = 1000 * 60 * 60;
const getPeriod = (uf: UserFeed) => {
  const now = Date.now();
  let timeMS = uf.lastDigestSentAt?.getTime() || uf.lastViewedItemDate?.getTime() || 0;
  if (!timeMS) timeMS = now - (scheduleHours[uf.schedule] + 1) * hour;
  return new Date(Math.max(timeMS, now - hour * 48));
};

async function sendDigest(uf: UserFeedWithOpts, feed: Feed, items: ItemWithEnclosures[]) {
  if (!items.length) return { errors: null };

  const { text, html, errors } = composeDigest(uf, feed, items);
  if (errors?.length) return { errors };

  const { customSubject } = uf.user.options;
  const subject = composeEmailSubject(
    uf.title || feed.title || feed.link || feed.url,
    uf.schedule,
    customSubject,
  );
  const from = process.env.MAIL_FROM;
  const result = await transport.sendMail({ from, to: uf.user.email, subject, text, html });
  return { result, errors: null };
}

export let buildAndSendDigests = async (feedId: number) => {
  const userFeedsWithUser = await userFeedsWithDigests(feedId);
  const readyUFs = userFeedsWithUser.filter(isFeedReady);
  if (!readyUFs.length) return;

  const selected = await db.select().from(feeds).where(eq(feeds.id, feedId)).execute();
  const feed = selected[0];
  if (!feed) throw new Error('feed not found');

  await digestQueue.addAll(
    readyUFs.map((uf) => async () => {
      try {
        const timestamp = new Date();
        const items = await getItemsNewerThan(feedId, getPeriod(uf), {
          limit: maxItemsInDigest,
          usePubDate: !uf.lastDigestSentAt,
          filter: uf.filter,
        });
        const { errors, result } = await sendDigest(uf, feed, items);
        if (errors) {
          logger.error(errors);
          return;
        }
        logger.info(result, 'digest email has been sent');
        await db
          .update(userFeeds)
          .set({ lastDigestSentAt: timestamp })
          .where(eq(userFeeds.id, uf.id))
          .execute();
      } catch (error) {
        logger.error(error);
      }
    }),
  );
};

export const buildAndSendDigestsMock = (mock: typeof buildAndSendDigests) => {
  buildAndSendDigests = mock;
};
