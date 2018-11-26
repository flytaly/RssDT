const Mutations = {
    async addFeed(parent, args, ctx, info) {
        const { feedSchedule: schedule } = args;
        const email = args.email.trim().toLowerCase();
        const url = args.feedUrl.trim().toLowerCase();

        if (!url) { // TODO: add additional validations
            throw new Error('Not valid argument: feedUrl');
        }
        if (!email) { // TODO: add additional validations
            throw new Error('Not valid argument: email');
        }
        const feed = await ctx.db.mutation.upsertFeed({
            where: { url },
            create: { url },
            update: {},
        });

        const userFeedExists = await ctx.db.exists.UserFeed({
            user: { email },
            feed: { url },
        });

        if (userFeedExists) throw new Error('The feed was already added');

        const createNewUserFeed = {
            create: {
                schedule,
                feed: { connect: { id: feed.id } },
            },
        };

        const user = await ctx.db.mutation.upsertUser({
            where: { email },
            create: {
                email,
                permissions: { set: ['USER'] },
                feeds: createNewUserFeed,
            },
            update: {
                feeds: createNewUserFeed,
            },
        }, info);

        return user;
    },
};

module.exports = Mutations;
