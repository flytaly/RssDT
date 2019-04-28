async function deleteMyFeed(parent, args, ctx) {
    const { user } = ctx.request;
    const { id } = args;

    if (!await ctx.db.exists.UserFeed({ id, user: { id: user.id } })) {
        return null;
    }

    const userFeed = await ctx.db.mutation.deleteUserFeed({ where: { id } });

    return userFeed;
}

module.exports = deleteMyFeed;
