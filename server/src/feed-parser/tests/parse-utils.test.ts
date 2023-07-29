import {
  checkFeedInfo,
  getFeedStream,
  getNewItems,
  parseFeed,
} from '#root/feed-parser/parse-utils.js';
import test from 'ava';
import nock from 'nock';
import { Readable } from 'stream';
import { feeds } from './mocks/feeds.js';
import { pages } from './mocks/pages-with-feed.js';

test.afterEach(() => {
  nock.cleanAll();
});

const mockFeeds = () =>
  feeds.forEach(({ url, mock }) => {
    nock(url.origin).persist().get(url.pathname).reply(200, mock);
  });

const mockPages = () =>
  Object.values(pages).map((page) =>
    nock(page.url.origin).persist().get(page.url.pathname).reply(200, page.body),
  );

const mockFeedsWithUpdates = () =>
  feeds.forEach(({ url, mock, updateMock }) => {
    nock(url.origin)
      .get(url.pathname)
      .reply(200, mock)
      .get(url.pathname)
      .once()
      .reply(200, updateMock);
  });

async function getText(stream: Readable) {
  return new Promise<string>((resolve, reject) => {
    let body = '';
    stream.on('data', (chunk) => {
      body += chunk;
    });
    stream.on('error', (error) => reject(error));
    stream.on('end', () => resolve(body));
  });
}

test.serial('feed stream tests', async (t) => {
  mockFeeds();
  t.truthy(feeds.length);
  const promises = feeds.map(async ({ url }) => {
    const { feedStream } = await getFeedStream(url.href);
    t.is(typeof feedStream.pipe, 'function', 'have pipe method');
    return getText(feedStream);
  });
  const responses = await Promise.all(promises);
  responses.forEach((response, idx) => t.is(response, feeds[idx].mock, 'feed body'));
});

test.serial('find RSS feed url in html <head>', async (t) => {
  mockPages();

  // page with rss
  let { feedStream, feedUrl } = await getFeedStream(pages.pageWithRSS.url.href, null, false);
  t.is(feedUrl, pages.pageWithRSS.url.href, 'page url');
  t.is(await getText(feedStream), pages.pageWithRSS.body, 'page body content');

  // find rss url and get content
  ({ feedStream, feedUrl } = await getFeedStream(pages.pageWithRSS.url.href, null, true));
  t.is(feedUrl, pages.rssFeed.url.href, 'rss url');
  t.is(await getText(feedStream), pages.rssFeed.body, 'rss content');

  // find atom url and get content
  ({ feedStream, feedUrl } = await getFeedStream(pages.pageWithAtom.url.href, null, true));
  t.is(feedUrl, pages.atomFeed.url.href, 'atom url');
  t.is(await getText(feedStream), pages.atomFeed.body, 'atom content');

  // feed with absolute url
  ({ feedStream, feedUrl } = await getFeedStream(pages.pageWithAbsoluteUrl.url.href, null, true));
  t.is(feedUrl, pages.absoluteUrlFeed.url.href, 'absolue url feed');
  t.is(await getText(feedStream), pages.absoluteUrlFeed.body, 'absolute url feed content');
});

feeds.forEach(({ url, itemsNum }) => {
  test.serial(`should return array of items ${url.hostname}`, async (t) => {
    mockFeedsWithUpdates();

    const { feedStream } = await getFeedStream(url.href);
    const { feedItems } = await parseFeed(feedStream);
    t.truthy(Array.isArray(feedItems));
    t.is(feedItems.length, itemsNum);
    t.truthy(feedItems[0].title);
    t.truthy(feedItems[0].description);
    t.truthy(feedItems[0].pubdate);
  });
});

feeds.forEach(({ url, itemsNum, itemsNumUpdated }) => {
  test.serial(`should return only new items after update ${url.hostname}`, async (t) => {
    mockFeedsWithUpdates();
    const { feedItems: items } = await getNewItems(url.href);
    const { feedItems: itemsUpd } = await getNewItems(url.href, items);
    const intersect = itemsUpd.filter(({ pubdate }) => items[items.length - 1].pubdate! > pubdate!);
    t.is(items.length, itemsNum, 'items length');
    t.is(itemsUpd.length, itemsNumUpdated, 'updated items length');
    t.is(intersect.length, 0, 'no itersect');
  });
});

test.serial('checkFeedInfo: valid feed', async (t) => {
  mockFeeds();
  await Promise.all(
    feeds.map(async ({ url }) => {
      const { feedStream } = await getFeedStream(url.href);
      const { isFeed, meta, error } = await checkFeedInfo(feedStream);
      t.true(isFeed);
      t.true(typeof meta === 'object');
      t.falsy(error);
    }),
  );
});
test.serial('checkFeedInfo: broken but still a feed', async (t) => {
  mockFeeds();
  const stream = new Readable();
  stream.push(
    '<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' +
      '<title>Feed Title</title>' +
      '<item><title>Test</title></item>',
  );
  stream.push(null);
  const { isFeed, meta, error } = await checkFeedInfo(stream);
  t.true(isFeed);
  t.is(meta?.title, 'Feed Title');
  t.falsy(error);
});

test.serial('checkFeedInfo: not a feed', async (t) => {
  mockFeeds();
  const stream = new Readable();
  stream.push('<?xml version="1.0"?>Totally not a feed');
  stream.push(null);
  const { isFeed, meta, error } = await checkFeedInfo(stream);
  t.false(isFeed);
  t.falsy(meta);
  t.is(error?.message, 'Not a feed');
});
