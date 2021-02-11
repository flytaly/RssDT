// import axios from 'axios';
import { Readable } from 'stream';
import nock from 'nock';
import { feeds } from './mocks/feeds';
import { pages } from './mocks/pages-with-feed';
import { getFeedStream, checkFeedInfo, getNewItems, parseFeed } from './parse-utils';

describe('Test feed stream', () => {
  beforeAll(() => {
    feeds.forEach(({ url, mock }) => nock(url.origin).persist().get(url.pathname).reply(200, mock));
  });

  afterAll(() => {
    nock.cleanAll();
  });

  it('should have pipe method', () =>
    Promise.all(
      feeds.map(async ({ url }) => {
        const { feedStream } = await getFeedStream(url.href);
        expect(typeof feedStream.pipe).toBe('function');
      }),
    ));

  it('should emit raw feed body', () =>
    Promise.all(
      feeds.map(async ({ url, mock }) => {
        const { feedStream } = await getFeedStream(url.href);
        let feedBody = '';
        feedStream.on('data', (chunk) => {
          feedBody += chunk;
        });
        feedStream.on('end', () => {
          expect(feedBody).toBe(mock);
        });
      }),
    ));
});

describe('Find feed url in html <head>', () => {
  beforeAll(() => {
    Object.values(pages).map((page) => nock(page.url.origin).persist().get(page.url.pathname).reply(200, page.body));
  });

  afterAll(() => {
    nock.cleanAll();
  });
  test('should return stream with page body', async () => {
    const { url } = pages.pageWithRSS;
    const { feedStream, feedUrl } = await getFeedStream(url.href, {}, false);
    expect(feedUrl).toBe(url.href);
    let feedBody = '';
    feedStream.on('data', (chunk) => {
      feedBody += chunk;
    });
    feedStream.on('end', () => {
      expect(feedBody).toBe(pages.pageWithRSS.body);
    });
  });
  test("should find feed and return stream with RSS feed's body", async () => {
    const { url } = pages.pageWithRSS;
    const { feedStream, feedUrl } = await getFeedStream(url.href, {}, true);
    expect(feedUrl).toBe(pages.rssFeed.url.href);
    let feedBody = '';
    feedStream.on('data', (chunk) => {
      feedBody += chunk;
    });
    feedStream.on('end', () => {
      expect(feedBody).toBe(pages.rssFeed.body);
    });
  });
  test("should find feed and return stream with Atom feed's body", async () => {
    const { url } = pages.pageWithAtom;
    const { feedStream, feedUrl } = await getFeedStream(url.href, {}, true);
    expect(feedUrl).toBe(pages.atomFeed.url.href);
    let feedBody = '';
    feedStream.on('data', (chunk) => {
      feedBody += chunk;
    });
    feedStream.on('end', () => {
      expect(feedBody).toBe(pages.atomFeed.body);
    });
  });
  test('should find feed with absolute path', async () => {
    const { url } = pages.pageWithAbsoluteUrl;
    const { feedStream, feedUrl } = await getFeedStream(url.href, {}, true);
    expect(feedUrl).toBe(pages.absoluteUrlFeed.url.href);
    let feedBody = '';
    feedStream.on('data', (chunk) => {
      feedBody += chunk;
    });
    feedStream.on('end', () => {
      expect(feedBody).toBe(pages.absoluteUrlFeed.body);
    });
  });
});

describe('Test feed parser', () => {
  beforeEach(() => {
    feeds.forEach(({ url, mock, updateMock }) => {
      nock(url.origin).get(url.pathname).reply(200, mock).get(url.pathname).once().reply(200, updateMock);
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  feeds.forEach(({ url }) => {
    it(`should return array of feeds ${url.hostname}`, async () => {
      const { feedStream } = await getFeedStream(url.href);

      const { feedItems: feed } = await parseFeed(feedStream);
      expect(Array.isArray(feed)).toBeTruthy();
      expect(feed[0]).toHaveProperty('title');
      expect(feed[0]).toHaveProperty('description');
      expect(feed[0]).toHaveProperty('pubDate');
    });
  });

  feeds.forEach(({ url, itemsNum, itemsNumUpdated }) => {
    it(`should return only new items after update ${url.hostname}`, async () => {
      const { feedItems: items } = await getNewItems(url.href);
      const { feedItems: itemsUpd } = await getNewItems(url.href, items);
      const intersect = itemsUpd.filter(({ pubdate }) => items[items.length - 1].pubdate! > pubdate!);
      expect(items.length).toBe(itemsNum);
      expect(itemsUpd.length).toBe(itemsNumUpdated);
      expect(intersect.length).toBe(0);
    });
  });
});

describe('Test checkFeedInfo function', () => {
  beforeAll(() => {
    feeds.forEach(({ url, mock }) => {
      nock(url.origin).persist().get(url.pathname).reply(200, mock);
    });
  });

  afterAll(() => {
    nock.cleanAll();
  });

  it(`should be a valid feed`, async () => {
    await Promise.all(
      feeds.map(async ({ url }) => {
        const { feedStream } = await getFeedStream(url.href);
        const { isFeed, meta, error } = await checkFeedInfo(feedStream);
        expect(isFeed).toBeTruthy();
        expect(typeof meta === 'object').toBeTruthy();
        expect(error).toBeUndefined();
      }),
    );
  });

  it('should be broken but still a feed', async () => {
    const stream = new Readable();
    stream.push(
      '<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' +
        '<title>Feed Title</title>' +
        '<item><title>Test</title></item>',
    );
    stream.push(null);
    const { isFeed, meta, error } = await checkFeedInfo(stream);
    expect(isFeed).toBeTruthy();
    expect(meta).toMatchObject({ title: 'Feed Title' });
    expect(error).toBeUndefined();
  });

  it('should not be a feed', async () => {
    const stream = new Readable();
    stream.push('<?xml version="1.0"?>Totally not a feed');
    stream.push(null);
    const { isFeed, meta, error } = await checkFeedInfo(stream);
    expect(isFeed).toBeFalsy();
    expect(meta).toBeFalsy();
    expect(error?.message).toEqual('Not a feed');
  });
});
