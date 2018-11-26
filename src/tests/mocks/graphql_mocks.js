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

module.exports = {
    user,
    addFeed,
    addNewFeed,
};
