const pick = require('lodash.pick');

function filterMeta(feedMeta) {
    const fields = ['title', 'description', 'link', 'language'];
    const meta = pick(feedMeta, fields);
    meta.imageUrl = feedMeta.image.url;
    meta.imageTitle = feedMeta.image.title;
    return meta;
}

function filterFields(item) {
    const fields = ['title', 'description', 'summary', 'pubDate', 'link', 'guid'];
    const encFields = ['url', 'type', 'length'];

    const obj = pick(item, fields);
    if (item.image && item.image.url) {
        obj.imageUrl = item.image.url;
    }
    if (item.enclosures && item.enclosures.length) {
        obj.enclosures = { create: item.enclosures.map(e => pick(e, encFields)) };
    }

    return obj;
}

module.exports = { filterFields, filterMeta };
