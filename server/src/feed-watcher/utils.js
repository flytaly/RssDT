const sanitizeHtml = require('sanitize-html');
const pick = require('lodash.pick');

function filterMeta(feedMeta) {
    if (!feedMeta) return {};
    const fields = ['title', 'description', 'link', 'language'];
    const meta = pick(feedMeta, fields);
    meta.imageUrl = feedMeta.image ? feedMeta.image.url : null;
    meta.imageTitle = feedMeta.image ? feedMeta.image.title : null;

    return meta;
}

function filterAndClearHtml(item) {
    const imgSchemes = ['https', 'http'];
    const cleanHtml = dirty => sanitizeHtml(dirty, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedSchemesByTag: { img: imgSchemes },
        // Only allow imgs with absolute paths
        exclusiveFilter(frame) {
            if (frame.tag === 'img') {
                const { src } = frame.attribs;
                return !src || imgSchemes.every(scheme => !src.startsWith(`${scheme}://`));
            }
            return false;
        },
    });

    const fields = ['title', 'description', 'summary', 'pubDate', 'link', 'guid'];
    const encFields = ['url', 'type', 'length'];

    const obj = pick(item, fields);
    if (item.image && item.image.url) {
        obj.imageUrl = item.image.url;
    }
    if (item.enclosures && item.enclosures.length) {
        obj.enclosures = { create: item.enclosures.map(e => pick(e, encFields)) };
    }
    obj.description = obj.description ? cleanHtml(obj.description) : null;
    obj.summary = obj.summary ? cleanHtml(obj.summary) : null;

    return obj;
}


module.exports = { filterAndClearHtml, filterMeta };
