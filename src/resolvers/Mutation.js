const Mutations = {
    async createUser(parent, args, ctx, info) {
        const { email, feedUrl: url, feedSchedule: schedule } = args;

        if (!url) { // create user without feed
            const user = await ctx.db.mutation.createUser({
                data: { email },
            }, info);
            return user;
        }

        const feedExist = await ctx.db.exists.Feed({ url });
        let feed;
        if (feedExist) {
            feed = { connect: { url } };
        } else {
            feed = { create: { url } };
        }
        const user = await ctx.db.mutation.createUser({
            data: {
                email,
                feeds: {
                    create: {
                        schedule,
                        feed,
                    },
                },
            },
        }, info);
        return user;
    },
};

module.exports = Mutations;
