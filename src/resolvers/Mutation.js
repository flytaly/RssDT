const Mutations = {
    async createUser(parent, args, ctx, info) {
        const user = await ctx.db.mutation.createUser({
            data: { email: args.email },
        }, info);
        return user;
    },
};

module.exports = Mutations;
