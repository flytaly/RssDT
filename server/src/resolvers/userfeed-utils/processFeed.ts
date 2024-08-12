import { eq, or } from 'drizzle-orm';
import FeedParser from 'feedparser';

import { DB } from '#root/db/db.js';
import { feeds } from '#root/db/schema.js';
import { getFeedStream, parseFeed } from '#root/feed-parser/index.js';
import { logger } from '#root/logger.js';
import { ArgumentError } from '#root/resolvers/resolver-types/errors.js';

export const getFeedVariations = (url: string) => {
  const urlsArray = [eq(feeds.url, url)];
  const httpsUrl = url.replace(/^http:\/\//, 'https://');
  if (httpsUrl !== url) {
    urlsArray.push(eq(feeds.url, httpsUrl));
  }
  return urlsArray;
};

export async function selectFeed(db: DB, url: string) {
  const selected = await db
    .select()
    .from(feeds)
    .where(or(...getFeedVariations(url)));
  return selected[0];
}
/** Selects feed from database or fetches information about it if it doesn't exist in DB. */
export async function processFeed(db: DB, url: string) {
  let feed = await selectFeed(db, url);
  if (feed) return { feed, url: feed.url };

  let feedMeta: FeedParser.Meta;
  let feedItems: FeedParser.Item[];
  let newUrl: string = url;
  try {
    const { feedStream, feedUrl } = await getFeedStream(url, { timeout: 6000 }, true);
    newUrl = feedUrl;
    ({ feedMeta, feedItems } = await parseFeed(feedStream));
    if (!feedMeta) throw new Error('Not a feed');
  } catch (e) {
    if (e.message === 'Not a feed') {
      return { errors: [new ArgumentError('url', e.message)] };
    }
    logger.error(`Couldn't get access to feed: ${url}. ${e.code} ${e.message}`);
    return { errors: [new ArgumentError('url', `Couldn't get access to feed`)] };
  }
  // try selecting again with the actual url of the feed
  if (newUrl !== url) {
    url = newUrl;
    feed = await selectFeed(db, url);
  }
  return { feedMeta, feedItems, url, feed };
}
