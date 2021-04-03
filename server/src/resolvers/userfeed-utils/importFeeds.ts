import PQueue from 'p-queue';
import { User } from '#entities';
import { maxItemsPerUser } from '../../constants';
import { logger } from '../../logger';
import { normalizes, validates } from '../../middlewares/normalize-validate-args';
import { getUserAndCountFeeds } from '../queries/countUserFeeds';
import { ArgumentError } from '../resolver-types/errors';
import { FeedImport, ImportFeedsResponse } from '../resolver-types/userFeedTypes';
import { createUserFeed } from './createUserFeed';
import { ImportStatus } from './ImportStatus';

const updateQueue = new PQueue({ concurrency: 3, timeout: 60000 });

export type FeedImportResult = {
  url: string;
  success?: boolean;
  error?: string;
};

async function importFeed(feed: FeedImport, user: User): Promise<FeedImportResult> {
  const { schedule, title } = feed;
  const url = normalizes.feedUrl(feed.url);
  const val = validates.feedUrl.validate(url);
  if (val.error) return { url, error: val.error.message };
  const results = await createUserFeed({
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

  const userWithCount = await getUserAndCountFeeds({ userId });
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
        const result = await importFeed(f, userWithCount);
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
