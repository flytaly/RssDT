
async function updateMyFeed(parent, args, ctx) {
    const { user } = ctx.request;
    if (!user) { throw new Error('Authentication is required'); }

    const { id, data } = args;

    const userFeed = await ctx.db.mutation.updateUserFeed({ data, where: { id } });

    return userFeed;
}

module.exports = updateMyFeed;
