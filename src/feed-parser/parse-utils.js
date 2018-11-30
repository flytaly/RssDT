const axios = require('axios');
const FeedParser = require('feedparser');

const MAX_ITEMS = 50;

/**
 * Generate readable stream with content on given url
 * @param {string} url
 * @returns {Promise<stream>}
 */
function getFeedStream(url) {
    const axiosOptions = {
        method: 'get',
        responseType: 'stream',
        headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) '
            + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
        },
    };

    return axios({
        ...axiosOptions,
        url,
    })
        .then(response => response.data);
}

/**
 * Check if an item doesn't already exist.
 * 'existingItems' should be sorted by date, i.e. the last item in array
 * is the newest by date.
 * @param {Object} newItem
 * @param {Object.<Date>} newItem.pubDate
 * @param {Array.<Object>} existingItems
 * @returns {boolean}
 */
function isNewItem(newItem, existingItems) {
    const lastItem = existingItems[existingItems.length - 1];

    if (!lastItem.pubDate || !newItem.pubDate) return existingItems.every(oldItem => oldItem.guid !== newItem.guid);

    const oldDate = new Date(lastItem.pubDate);
    const newDate = new Date(newItem.pubDate);
    if (oldDate < newDate) {
        return true;
    }

    return false;
}

/**
 * Parse stream and return promise with new feed items if existing items are provided
 * @param stream
 * @param {Array.<Object>} [existingItems]
 * @returns {Promise<Array>}
 */
function parseFeed(stream, existingItems = [{ pubDate: 0 }]) {
    const feedItems = [];
    const feedParser = new FeedParser();

    return new Promise((resolve, reject) => {
        stream
            .on('error', (error) => { reject(error); })
            .pipe(feedParser)
            .on('error', (error) => {
                if (error.message === 'Feed exceeded limit') resolve(feedItems);
                else reject(error);
                feedParser.end();
            })
            .on('data', (item) => {
                if (feedItems.length >= MAX_ITEMS) {
                    throw new Error('Feed exceeded limit');
                }
                if (item && isNewItem(item, existingItems)) {
                    feedItems.push(item);
                }
            })
            .on('end', () => { resolve(feedItems); });
    });
}


/**
 * Parse feed on given url and return new items if existing items are provided
 * @param url
 * @param {Array.<Object>} [existingItems]
 * @returns {Array.<Object>}
 */
async function getNewItems(url, existingItems = [{ pubDate: 0 }]) {
    const feedStream = await getFeedStream(url);
    const feed = await parseFeed(feedStream, existingItems.length ? existingItems : [{ pubDate: 0 }]);
    return feed;
}

/**
 * Check if given stream is correct feed stream
 * @param stream
 * @returns {Promise<boolean>}
 */
async function isFeed(stream) {
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
                .on('data', (item) => {
                    if (item) throw new Error('OK');
                })
                .on('end', () => resolve(true));
        });
    } catch (err) {
        //  console.log('Error:', err);
        return false;
    }
    return true;
}

module.exports = {
    getNewItems,
    getFeedStream,
    parseFeed,
    isFeed,
};
