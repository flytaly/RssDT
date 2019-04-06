const Queries = {
    async me(parent, args, ctx, info) {
        const { user } = ctx.request;
        if (!user) { throw new Error('Authentication is required'); }

        return ctx.db.query.user({ where: { id: user.id } }, info);
    },

};

module.exports = Queries;
