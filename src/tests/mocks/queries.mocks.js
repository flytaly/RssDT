const moduleName = 'queries';

module.exports = {
    user: {
        email: `${moduleName}TestUser@test.com`,
        password: 'userPassword',
    },
    feed: {
        url: `http://${moduleName}Somefeed.com`,
        schedule: 'EVERYHOUR',
    },
};
