const { forwardTo } = require('prisma-binding');

const noSuchFeedMsg = 'The feed doesn\'t exist or you are not subscribed to it';

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
        const userFeedExists = await ctx.db.exists.UserFeed({
            user: { id: user.id },
            feed: { id },
        });

        if (!userFeedExists) return new Error(noSuchFeedMsg);

        return ctx.db.query.feedItems({ where: { feed: { id } } }, info);
    },

    async myFeedItemsConnection(parent, args, ctx, info) {
        const { user } = ctx.request;
        const { feedId: id } = args;
        const userFeedExists = await ctx.db.exists.UserFeed({
            user: { id: user.id },
            feed: { id },
        });
        if (!userFeedExists) return new Error(noSuchFeedMsg);

        return ctx.db.query.feedItemsConnection({ where: {
            feed: { id },
        } }, info);
    },

    async userFeedTitle(parent, args, ctx) {
        const { id } = args;
        const userFeed = await ctx.db.query.userFeed({ where: { id } }, '{ feed { title url link }  }');
        if (!userFeed || !userFeed.feed) {
            return new Error('The feed doesn\'t exist');
        }
        const { title, link, url } = userFeed.feed;

        return { title: title || link || url };
    },

    users: forwardTo('db'),
    usersConnection: forwardTo('db'),
    feeds: forwardTo('db'),
    feedsConnection: forwardTo('db'),
};

module.exports = Queries;
