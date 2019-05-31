const db = require('./bind-prisma');

async function setUserFeedLastUpdate(userFeedId, timestamp) {
    return db.mutation.updateUserFeed({
        data: {
            lastUpdate: timestamp || new Date(),
        },
        where: {
            id: userFeedId,
        },
    });
}

async function getActiveUserFeeds(feedUrl) {
    return db.query.userFeeds({
        where: {
            feed: {
                url: feedUrl,
            },
            activated: true,
        },
    }, '{ id lastUpdate schedule user { email timeZone } }');
}

async function getFeedInfo(url) {
    return db.query.feed({ where: { url } });
}

async function getItemsNewerThan(url, time, first) {
    return db.query.feedItems({
        where: {
            feed: { url },
            createdAt_gte: time,
        },
        ...(first && { first }),
        orderBy: 'pubDate_DESC',
    }, '{ title summary link pubDate imageUrl enclosures { url type length } }');
}

module.exports = {
    setUserFeedLastUpdate, getActiveUserFeeds, getFeedInfo, getItemsNewerThan,
};
