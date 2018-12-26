const mjml2html = require('mjml');
const url = require('url');
const themes = require('./themes');

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
 * @property {String} description
 * @property {String} pubDate
 * @property {enclosures} enclosures
 */
/**
 * Generate Email HTML content with given feed's articles
 * @param {Object} info - information about feed and mail
 * @param {String} feedInfo.title - feed title
 * @param {String} [feedInfo.theme='default'] - email's theme
 * @param {Array.<feedItem>} feedItems
 */
const composeHTML = (info, feedItems) => {
    /* eslint-disable no-param-reassign */
    const theme = themes[info.theme ? info.theme : 'default'];
    const header = theme.header(info);
    const items = feedItems.reduce((acc, item) => {
        // if there is no image try to find it in enclosures. Many feeds save images in enclosures.
        if (!item.imageUrl) { item.imageUrl = getImageFromEnclosures(item.enclosures); }
        if (item.enclosures) { item.enclosures = addTitlesToEnclosures(item.enclosures); }
        return acc + theme.item(item);
    }, '');
    const footer = theme.footer(info);
    return mjml2html(header + items + footer, { minify: true });
};

module.exports = { composeHTML };
