const Queries = {
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
        if (!await ctx.db.exists.UserFeed({
            user: { id: user.id },
            feed: { id },
        })) {
            return [];
        }
        return ctx.db.query.feedItems({ where: { feed: { id } } }, info);
    },

};

module.exports = Queries;
