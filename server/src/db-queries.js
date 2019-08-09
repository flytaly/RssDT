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
    const userFields = 'user { email timeZone locale shareEnable filterShare dailyDigestHour withContentTableDefault }';
    return db.query.userFeeds({
        where: {
            feed: {
                url: feedUrl,
            },
            activated: true,
        },
    }, `{ id lastUpdate schedule withContentTable ${userFields} }`);
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
    }, '{ id title summary description link pubDate imageUrl enclosures { url type length } }');
}

module.exports = {
    setUserFeedLastUpdate, getActiveUserFeeds, getFeedInfo, getItemsNewerThan,
};
