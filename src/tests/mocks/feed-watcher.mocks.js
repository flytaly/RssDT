const moduleName = 'feedwatcher';

const id = `${moduleName}_ID`;

const feed = {
    url: `http://${moduleName}testfeed1.com`,
};

const oldFeedItems = [{ guid: `${moduleName}_guid1`, pubDate: 'Fri, 30 Nov 2018 20:00:00 GMT' }];
const newFeedItems = [{ guid: `${moduleName}_guid2`, pubDate: 'Fri, 30 Nov 2018 22:00:00 GMT' }];

const item = {
    title: 'title',
    description: 'description',
    summary: 'summary',
    pubDate: new Date(),
    link: 'link',
    guid: `${moduleName}_item_guid`,
};

const itemImage = { url: `http://${moduleName}imageurl` };

const enclosures = [{
    url: 'http://somesite.com/encolsureImg.jpg',
    type: 'image/jpeg',
    length: '100000',
}, {
    url: 'http://somesite.com/encolsureAudio.mp3',
    type: 'audio/mpeg',
    length: '200000000',
}];

module.exports = {
    feed,
    oldFeedItems,
    newFeedItems,
    item,
    itemImage,
    enclosures,
    id,
};
