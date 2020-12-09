const moduleName = 'feedwatcher';

const id = `${moduleName}_ID`;

const feed = {
    url: `http://${moduleName}testfeed1.com`,
};

const oldFeedItems = [{ guid: `${moduleName}_guid1`, pubDate: 'Fri, 30 Nov 2018 20:00:00 GMT' }];
const newFeedItems = [{ guid: `${moduleName}_guid2`, pubDate: 'Fri, 30 Nov 2018 22:00:00 GMT' }];

const descriptionDirty = '<b class="some-class">description</b>'
    + '<img></img>'
    + '<img src="javascript:alert(\'!\')"></img>'
    + '<img src="http://absolute.path/img.jpg"></img>'
    + '<img src="relative.path"></img>'
    + '<video width="320"><source src="movie.mp4"'
    + 'type="video/mp4"></video>'
    + '<script>document.getElementById("id").innerHTML = "Hello";</script>'
    + '<ul><li>List Element</li></ul>';
const descriptionClean = '<b>description</b>'
    + '<img src="http://absolute.path/img.jpg" />'
    + '<ul><li>List Element</li></ul>';
const item = {
    title: 'title',
    description: descriptionDirty,
    summary: descriptionDirty,
    pubDate: new Date(),
    link: 'link',
    guid: `${moduleName}_item_guid`,
};

const itemClean = {
    ...item,
    description: descriptionClean,
    summary: descriptionClean,
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
    itemClean,
    itemImage,
    enclosures,
    id,
};
