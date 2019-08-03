const axios = require('axios');
const FeedParser = require('feedparser');
const iconv = require('iconv-lite');
const { Readable } = require('stream');

const MAX_ITEMS = 1000;

/**
 * Some feeds have an encoding in their declaration (like <?xml version="1.0" encoding="windows-1251"?>)
 * so they should be converted to a string in which declaration can be found
 * and then converted to a string again with the correct encoding.
 * The function was taken from github.com/szwacz/sputnik:
 * https://github.com/szwacz/sputnik/blob/5a68359a920aa3c1be4684c1f12b0d0d64e5745d/app/core/helpers/feed_parser.js#L42
 * @param {ArrayBuffer} bodyBuf
 * @return {String}
 */
const normalizeEncoding = (bodyBuf) => {
    let body = bodyBuf.toString();
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
            body = iconv.decode(bodyBuf, encoding);
        } catch (err) {
            // detected encoding is not supported, leave it as it is
        }
    }

    return body;
};

/**
 * Generate readable stream with content on given url
 * @param {string} url
 * @param {object} [options={}] - axios options
 * @returns {Promise<stream>}
 */
function getFeedStream(url, options = {}) {
    const axiosOptions = {
        method: 'get',
        responseType: 'arraybuffer',
        maxContentLength: 10000000,
        headers: {
            Accept: '*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) '
            + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
        },
        ...options,
    };

    return axios({
        ...axiosOptions,
        url,
    })
        .then(response => response.data)
        .then(buf => normalizeEncoding(buf))
        .then((data) => {
            const stream = new Readable();
            stream.push(data);
            stream.push(null);
            return stream;
        });
}

/**
 * Check if an item doesn't already exist.
 * 'existingItems' should be sorted by date, i.e. the last item in array
 * is the newest by date.
 * @param {Object} newItem
 * @param {Date} newItem.pubDate
 * @param {Array.<Object>} existingItems
 * @returns {boolean}
 */
function isNewItem(newItem, existingItems) {
    const lastItem = existingItems[existingItems.length - 1];

    if (lastItem.pubDate && newItem.pubDate) {
        const oldDate = new Date(lastItem.pubDate);
        const newDate = new Date(newItem.pubDate);
        if (oldDate > newDate) {
            return false;
        }
    }

    return existingItems.every(oldItem => oldItem.guid !== newItem.guid);
}

/**
 * @typedef {Object} FeedObject
 * @property {Array.<Object>} feedItems - New items of the feed
 * @property {Object} feedMeta - Feed meta information
 */
/**
 * Parse stream and return promise with new feed items if existing items are provided
 * @param stream
 * @param {Array.<Object>} [existingItems]
 * @param {Function} filter - callback that filters elements in every feed item
 * @returns {Promise<FeedObject>}
 */
function parseFeed(stream, existingItems = [{ pubDate: 0 }], filter) {
    const feedItems = [];
    let feedMeta;
    const feedParser = new FeedParser();

    return new Promise((resolve, reject) => {
        stream
            .on('error', (error) => { reject(error); })
            .pipe(feedParser)
            .on('error', (error) => {
                if (error.message === 'Feed exceeded limit') resolve({ feedItems, feedMeta });
                else reject(error);
                feedParser.end();
            })
            .on('meta', (meta) => {
                feedMeta = meta;
            })
            .on('data', (item) => {
                if (feedItems.length >= MAX_ITEMS) {
                    throw new Error('Feed exceeded limit');
                }
                if (item && isNewItem(item, existingItems)) {
                    feedItems.push(filter ? filter(item) : item);
                }
            })
            .on('end', () => { resolve({ feedItems, feedMeta }); });
    });
}

/**
 * Parse feed on given url and return new items if existing items are provided
 * @param {string} url
 * @param {Array.<Object>} [existingItems]
 * @param {function} filter - callback that filters elements in every feed item
 * @returns {FeedObject}
 */
async function getNewItems(url, existingItems = [{ pubDate: 0 }], filter) {
    const feedStream = await getFeedStream(url);
    const feed = await parseFeed(feedStream,
        existingItems.length ? existingItems : [{ pubDate: 0 }],
        filter);
    return feed;
}

/**
 * Check if given stream is correct feed stream and return its meta
 * @param stream
 * @returns {{isFeed: boolean, meta: Object, error: object }
 */
async function checkFeedInfo(stream) {
    let feedMeta;
    try {
        const feedParser = new FeedParser();

        await new Promise((resolve, reject) => {
            stream
                .on('error', (e) => {
                    reject(e);
                })
                .pipe(feedParser)
                .on('error', (error) => {
                    if (error.message === 'OK') {
                        resolve(true);
                    } else reject(error);
                })
                .on('meta', (meta) => {
                    feedMeta = meta;
                    throw new Error('OK');
                })
                .on('end', () => resolve(true));
        });
    } catch (error) {
        //  console.log('Error:', error);
        return { isFeed: false, error };
    }
    return { isFeed: true, meta: feedMeta };
}

module.exports = {
    getNewItems,
    getFeedStream,
    parseFeed,
    checkFeedInfo,
};
