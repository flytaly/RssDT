import { maxItemsPerUser } from '#root/constants.js';
import { type DB } from '#root/db/db.js';
import { User } from '#root/db/schema.js';
import { logger } from '#root/logger.js';
import { normalizes, validates } from '#root/middlewares/normalize-validate-args.js';
import PQueue from 'p-queue';
import { getUserAndCountFeeds } from '../queries/countUserFeeds.js';
import { ArgumentError } from '../resolver-types/errors.js';
import { FeedImport, ImportFeedsResponse } from '../resolver-types/userFeedTypes.js';
import { createUserFeed } from './createUserFeed.js';
import { ImportStatus } from './ImportStatus.js';

const updateQueue = new PQueue({ concurrency: 3, timeout: 60000 });

export type FeedImportResult = {
  url: string;
  success?: boolean;
  error?: string;
};

async function importFeed(db: DB, feed: FeedImport, user: User): Promise<FeedImportResult> {
  const { schedule, title } = feed;
  const url = normalizes.feedUrl(feed.url);
  const val = validates.feedUrl.validate(url);
  if (val.error) return { url, error: val.error.message };
  const results = await createUserFeed(db, {
    url,
    user,
    feedOpts: {
      title,
      schedule,
    },
  });
  if (results.errors) return { url, error: results.errors[0].message };

  return { url, success: true };
}

export async function launchFeedsImport(
  db: DB,
  feeds: FeedImport[],
  userId: number,
): Promise<ImportFeedsResponse> {
  const status = new ImportStatus(userId);
  if (await status.isImporting()) {
    return { success: false, errors: [new ArgumentError(null, 'Importing feeds')] };
  }
  if (!feeds.length) return { errors: [new ArgumentError('feeds', 'No feeds provided')] };
  if (feeds.length > maxItemsPerUser)
    return { errors: [new ArgumentError('feeds', 'Too many feeds')] };

  const userWithCount = await getUserAndCountFeeds(db, { userId });
  if (!userWithCount) throw new Error("Couln't find user");
  if (!userWithCount.emailVerified) {
    return { errors: [new ArgumentError(null, "Account isn't verified")] };
  }
  if (userWithCount.countFeeds + feeds.length > maxItemsPerUser)
    return { errors: [new ArgumentError('feeds', 'Too many feeds')] };

  await status.start(feeds.length);

  updateQueue
    .addAll(
      feeds.map((f) => async () => {
        const result = await importFeed(db, f, userWithCount);
        await status.incr();
        return result;
      }),
    )
    .then(async (results) => {
      await status.done();
      const failed = results.filter((r) => r.error);
      if (failed.length) {
        await status.saveResults(JSON.stringify(failed));
      }
      logger.info({ userId, len: results.length, failed }, 'Feeds were imported');
    });

  return { success: true };
}
