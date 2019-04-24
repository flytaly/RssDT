async function deleteMyFeed(parent, args, ctx) {
    const { user } = ctx.request;
    if (!user) { throw new Error('Authentication is required'); }

    const { id } = args;

    const userFeed = await ctx.db.mutation.deleteUserFeed({ where: { id } });

    return userFeed;
}

module.exports = deleteMyFeed;
