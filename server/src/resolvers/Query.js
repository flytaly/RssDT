const Queries = {
    async me(parent, args, ctx, info) {
        const { user } = ctx.request;

        return ctx.db.query.user({ where: { id: user.id } }, info);
    },
    async myFeeds(parent, args, ctx, info) {
        const { user } = ctx.request;

        return ctx.db.query.userFeeds({ where: { user: { id: user.id } } }, info);
    },

};

module.exports = Queries;
