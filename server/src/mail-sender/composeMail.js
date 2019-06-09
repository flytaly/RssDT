const mjml2html = require('mjml');
const url = require('url');
const moment = require('moment-timezone');
const themes = require('./themes');
const share = require('./share');
/**
 * @typedef {Object} enclosure
 * @property {String} type
 * @property {String} url
 */
/**
 * Enclosures url could be too long.
 * This function reduces them to filename and saves them as 'title' property.
 * @param {Array.<enclosure>} enclosures
 */
const addTitlesToEnclosures = enclosures => enclosures.reduce((acc, enc) => {
    const parsedUrl = url.parse(enc.url).pathname;
    const filename = parsedUrl.split('/').pop();
    acc.push({ ...enc, title: filename || enc.url });
    return acc;
}, []);

const imagesTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp'];

const getImageFromEnclosures = (enclosures) => {
    const enc = enclosures.find(({ type }) => imagesTypes.includes(type));
    if (enc) return enc.url;
    return null;
};

/**
 * @typedef {Object} feedItem
 * @property {String} title
 * @property {String} link
 * @property {String} [imageUrl]
 * @property {String} summary
 * @property {String} pubDate
 * @property {enclosures} enclosures
 */
/**
 * Generate Email HTML content with given feed's articles
 * @param {Object} info - information about feed and mail
 * @param {String} feedInfo.title - feed title
 * @param {String} [feedInfo.theme='default'] - email's theme
 * @param {Array.<feedItem>} feedItems
 * @param {String} userFeedId - id of user's feed for unsubscribing
 * @return {{html: String, errors: Array}}
 */
const composeHTML = (info, feedItems, userFeed = {}) => {
    /* eslint-disable no-param-reassign */
    const {
        id: userFeedId = '',
        user: {
            timeZone = 'GMT',
            locale = 'en',
            shareEnable = true,
            filterShare = [],
        } = {},
    } = userFeed;

    const theme = themes[info.theme ? info.theme : 'default'];
    const header = theme.header(info);
    const items = feedItems.reduce((acc, item) => {
        // if there is no image try to find it in enclosures. Many feeds save images in enclosures.
        if (!item.imageUrl) { item.imageUrl = getImageFromEnclosures(item.enclosures); }
        if (item.enclosures) { item.enclosures = addTitlesToEnclosures(item.enclosures); }
        item.pubDate = moment(item.pubDate).tz(timeZone).locale(locale).format('llll');
        item.share = shareEnable
            ? share
                //  Empty filterShare array means nothing should be filtered!
                .filter(s => !filterShare.length || filterShare.includes(s.id))
                .map(s => ({ ...s, url: s.getUrl(item.link, item.title) }))
            : [];

        return acc + theme.item(item);
    }, '');
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?id=${userFeedId}`;
    const footer = theme.footer({ unsubscribeUrl });
    return mjml2html(header + items + footer, { minify: true });
};

module.exports = { composeHTML };
