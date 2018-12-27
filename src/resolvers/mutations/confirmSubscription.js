const logger = require('../../logger');

async function confirmSubscription(parent, args, ctx, info) {
    const { email, token } = args;
    const userFeeds = await ctx.db.query.userFeeds({
        where: {
            user: { email },
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

    // concurrent task that updates feed and then sets last update time to userFeed
    (async () => {
        try {
            await ctx.watcher.updateFeed(userFeed.feed.url);
            await ctx.watcher.setFeedUpdateTime(userFeed.feed.url);
        } catch (error) {
            logger.error({ url: userFeed.url, message: error.message }, 'Couldn\'t update a feed');
        }
        // set even if feed wasn't actually updated to have initial time
        await ctx.db.mutation.updateUserFeed({
            data: {
                lastUpdate: new Date(),
            },
            where: {
                id: userFeed.id,
            },
        });
    })();

    return { message: `Feed "${userFeed.feed.title ? userFeed.feed.title : userFeed.feed.url}" was activated` };
}

module.exports = confirmSubscription;
