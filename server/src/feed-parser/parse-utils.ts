import axios, { AxiosRequestConfig } from 'axios';
import FeedParser, { Item, Meta } from 'feedparser';
import iconv from 'iconv-lite';
import jsdom from 'jsdom';
import { Readable } from 'stream';
import normalizeUrl from 'normalize-url';
import { maxItemsInFeed } from '../constants';

const MAX_ITEMS = maxItemsInFeed;
const defaultAxiosOptions: AxiosRequestConfig = {
  method: 'get',
  responseType: 'arraybuffer',
  maxContentLength: 10000000,
  timeout: 25000,
  headers: {
    Accept: '*/*',
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
  },
};
const axiosInstance = axios.create(defaultAxiosOptions);

type ItemWithPubdate = {
  pubdate: Date | null;
  guid: string;
};

/**
 * Find feed url in the <link rel="alternate" type="application/rss+xml"...> tag
 * see: https://www.petefreitag.com/item/384.cfm
 * @param html - HTML page
 */
const findFeedUrl = (html: string, baseUrl: string, normalize = true) => {
  const dom = new jsdom.JSDOM(html);

  const normUrl = (url: string) =>
    normalize ? normalizeUrl(url, { defaultProtocol: 'https://' }) : url;

  const rss = dom.window.document.querySelector('link[type="application/rss+xml"]');
  const atom = dom.window.document.querySelector('link[type="application/atom+xml"]');
  if (rss) {
    const href = rss.getAttribute('href');
    if (href) {
      const url = new URL(href, baseUrl).href;
      if (url) return normUrl(url);
    }
  }
  if (atom) {
    const href = atom.getAttribute('href');
    if (href) {
      const url = new URL(href, baseUrl).href;
      if (url) return normUrl(url);
    }
  }
  return null;
};

/**
 * Some feeds have an encoding in their declaration (like <?xml version="1.0" encoding="windows-1251"?>)
 * so they should be converted to a string in which declaration can be found
 * and then converted to a string again with the correct encoding.
 * The function was taken from github.com/szwacz/sputnik:
 * https://github.com/szwacz/sputnik/blob/5a68359a920aa3c1be4684c1f12b0d0d64e5745d/app/core/helpers/feed_parser.js#L42
 */
const normalizeEncoding = (bodyBuf: ArrayBuffer, bodyStr: string) => {
  let body = bodyStr || bodyBuf.toString();
  let encoding;

  const xmlDeclaration = body.match(/^<\?xml .*\?>/);
  if (xmlDeclaration) {
    const encodingDeclaration = xmlDeclaration[0].match(/encoding=("|').*?("|')/);
    if (encodingDeclaration) {
      encoding = encodingDeclaration[0].substring(10, encodingDeclaration[0].length - 1);
    }
  }

  if (encoding && encoding.toLowerCase() !== 'utf-8') {
    try {
      body = iconv.decode(bodyBuf as Buffer, encoding);
    } catch (err) {
      // detected encoding is not supported, leave it as it is
    }
  }

  return body;
};

/** Generate readable stream with content on given url */
export async function getFeedStream(
  url: string,
  options: AxiosRequestConfig = {},
  tryFindFeedUrl: boolean = false, // indicates that given url could be an HTML page and url of the feed could be contained in <link> tag of the HTML page
): Promise<{ feedStream: Readable; feedUrl: string }> {
  const { data: bufData } = await axiosInstance({ ...options, url });

  const body = bufData.toString();

  let feedUrl;
  if (tryFindFeedUrl) {
    feedUrl = findFeedUrl(body, url);
    if (feedUrl) {
      return getFeedStream(feedUrl, options, false);
    }
  }

  const data = normalizeEncoding(bufData, body);

  const feedStream = new Readable();
  feedStream.push(data);
  feedStream.push(null);
  return { feedStream, feedUrl: feedUrl || url };
}

/**
 * Check if an item doesn't already exist.
 * existingItems should be sorted DESC
 */
function isNewItem(newItem: ItemWithPubdate, existingItems?: ItemWithPubdate[]): boolean {
  if (!existingItems || !existingItems.length) return true;

  const lastItem = existingItems[0];
  if (lastItem.pubdate && newItem.pubdate) {
    const oldDate = new Date(lastItem.pubdate);
    const newDate = new Date(newItem.pubdate);
    if (oldDate > newDate) {
      return false;
    }
  }

  return existingItems.every((oldItem: ItemWithPubdate) => oldItem.guid !== newItem.guid);
}

/** Parse stream and return promise with new feed items if existing items are provided */
export function parseFeed(
  stream: Readable,
  existingItems?: ItemWithPubdate[],
): Promise<{
  feedItems: Item[];
  feedMeta: Meta;
}> {
  const feedItems: Item[] = [];
  let feedMeta: Meta;
  const feedParser = new FeedParser({});
  return new Promise((resolve, reject) => {
    stream
      .on('error', (error) => {
        reject(error);
      })
      .pipe(feedParser)
      .on('error', (error: Error) => {
        if (error.message === 'Feed exceeded limit') resolve({ feedItems, feedMeta });
        else reject(error);
        feedParser.end();
      })
      .on('meta', (meta: Meta) => {
        feedMeta = meta;
      })
      .on('data', (item: Item) => {
        if (feedItems.length >= MAX_ITEMS) {
          throw new Error('Feed exceeded limit');
        }
        if (item && isNewItem(item, existingItems)) {
          feedItems.push(item);
        }
      })
      .on('end', () => {
        resolve({ feedItems, feedMeta });
      });
  });
}

/** Parse feed on given url and return new items if existing items are provided */
export async function getNewItems(url: string, existingItems?: ItemWithPubdate[]) {
  const { feedStream } = await getFeedStream(url);
  const feed = await parseFeed(feedStream, existingItems);
  return feed;
}

/** Check if given stream is correct feed stream and return its meta */
export async function checkFeedInfo(
  stream: Readable,
): Promise<{ isFeed: boolean; error?: Error; meta?: Meta }> {
  try {
    let feedMeta: Meta | undefined;
    const feedParser = new FeedParser({});

    await new Promise((resolve, reject) => {
      stream
        .on('error', (e) => {
          reject(e);
        })
        .pipe(feedParser)
        .on('error', (error: Error) => {
          if (error.message === 'OK') {
            resolve(true);
          } else reject(error);
        })
        .on('meta', (meta: Meta) => {
          feedMeta = meta;
          throw new Error('OK');
        })
        .on('end', () => resolve(true));
    });

    return { isFeed: true, meta: feedMeta };
  } catch (error) {
    //  console.log('Error:', error);
    return { isFeed: false, error };
  }
}
