const user = {
    email: 'test@test.com',
};

const addFeed = {
    email: 'testUser@test.com',
    feedUrl: 'http://testfeed.com',
    feedSchedule: 'EVERY2HOURS',
};
const addNewFeed = {
    ...addFeed,
    feedSchedule: 'EVERYHOUR',
    feedUrl: 'http://testfeed2.com',
};

const feed = {
    url: 'http://testfeed1.com',
};

const oldFeedItems = [{ guid: 'guid1', pubDate: 'Fri, 30 Nov 2018 20:00:00 GMT' }];
const newFeedItems = [{ guid: 'guid2', pubDate: 'Fri, 30 Nov 2018 22:00:00 GMT' }];

module.exports = {
    user,
    addFeed,
    addNewFeed,
    feed,
    oldFeedItems,
    newFeedItems,
};
