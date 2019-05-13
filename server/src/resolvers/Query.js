const { forwardTo } = require('prisma-binding');

const Queries = {
    feedItemsConnection: forwardTo('db'),
    async me(parent, args, ctx, info) {
        const { user } = ctx.request;

        return ctx.db.query.user({ where: { id: user.id } }, info);
    },
    async myFeeds(parent, args, ctx, info) {
        const { user } = ctx.request;

        return ctx.db.query.userFeeds({ where: { user: { id: user.id } } }, info);
    },
    async myFeedItems(parent, args, ctx, info) {
        const { user } = ctx.request;
        const { feedId: id } = args;
        const userFeedExists = await ctx.db.exists.UserFeed({
            user: { id: user.id },
            feed: { id },
        });

        if (!userFeedExists) return new Error('The feed doesn\'t exist or you are not subscribed to it');

        return ctx.db.query.feedItems({ where: { feed: { id } } }, info);
    },

};

module.exports = Queries;
