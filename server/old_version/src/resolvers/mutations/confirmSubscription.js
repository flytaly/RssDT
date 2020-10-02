const { logger } = require('../../logger');
const { setUserFeedLastUpdate } = require('../../db-queries');
const cache = require('../../cache');

async function confirmSubscription(parent, args, ctx) {
    const { token } = args;

    const userFeeds = await ctx.db.query.userFeeds({
        where: {
            activationToken: token,
            activationTokenExpiry_gte: new Date(),
        },
    }, '{ id feed { url title lastSuccessful } }');

    if (!userFeeds || !userFeeds.length) return new Error('Wrong or expired token');

    const userFeed = userFeeds[0];

    await ctx.db.mutation.updateUserFeed({
        data: {
            activated: true,
            activationToken: null,
        },
        where: {
            id: userFeed.id,
        },
    });

    await ctx.db.mutation.updateFeed({
        data: {
            activated: true,
        },
        where: {
            url: userFeed.feed.url,
        },
    });

    // concurrent task that updates feed and then sets last update time to userFeed
    (async () => {
        try {
            if (!userFeed.feed.lastSuccessful) {
                const { url } = userFeed.feed;

                const isLocked = await cache.isLocked(url);
                if (!isLocked) {
                    try {
                        await cache.lock(url);
                        await ctx.watcher.updateFeed(url);
                        await ctx.watcher.setFeedUpdateTime(url);
                    } catch (error) {
                        logger.error({ url, message: error.message }, 'Couldn\'t update a feed');
                    }
                    await cache.unlock(url);
                }
            }
        } catch (e) {
            logger.error(e);
        }
        // set even if feed wasn't actually updated to have initial time
        await setUserFeedLastUpdate(userFeed.id);
    })();

    return { message: `Feed "${userFeed.feed.title ? userFeed.feed.title : userFeed.feed.url}" was activated` };
}

module.exports = confirmSubscription;
