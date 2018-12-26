const moduleName = 'mutations';

const user = {
    email: `${moduleName}TestUser@test.com`,
    password: 'userPassword',
};

const activationToken = '---activation-token---';

const feedTitle = 'Test Feed Title';

const addNotAFeed = {
    email: user.email,
    feedUrl: `http://${moduleName}notafeed.com`,
    feedSchedule: 'EVERY2HOURS',
};

const addFeed = {
    email: user.email,
    feedUrl: `http://${moduleName}testfeed.com`,
    feedSchedule: 'EVERY2HOURS',
};

const addNewFeed = {
    ...addFeed,
    feedSchedule: 'EVERYHOUR',
    feedUrl: `http://${moduleName}testfeed2.com`,
};

module.exports = {
    user,
    addFeed,
    feedTitle,
    activationToken,
    addNotAFeed,
    addNewFeed,
};
