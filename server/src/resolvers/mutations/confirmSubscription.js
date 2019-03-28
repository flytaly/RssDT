const logger = require('../../logger');
const { setUserFeedLastUpdate } = require('../../db-queries');

async function confirmSubscription(parent, args, ctx, info) {
    const { token } = args;

    const userFeeds = await ctx.db.query.userFeeds({
        where: {
            activationToken: token,
            activationTokenExpiry_gte: new Date(),
        },
    }, '{ id feed { url title } }');

    if (!userFeeds || !userFeeds.length) throw new Error('Wrong or expired token');

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
            await ctx.watcher.updateFeed(userFeed.feed.url);
            await ctx.watcher.setFeedUpdateTime(userFeed.feed.url);
        } catch (error) {
            logger.error({ url: userFeed.url, message: error.message }, 'Couldn\'t update a feed');
        }
        // set even if feed wasn't actually updated to have initial time
        await setUserFeedLastUpdate(userFeed.id);
    })();

    return { message: `Feed "${userFeed.feed.title ? userFeed.feed.title : userFeed.feed.url}" was activated` };
}

module.exports = confirmSubscription;
