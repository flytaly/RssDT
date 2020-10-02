
async function updateMyFeed(parent, args, ctx) {
    const { user } = ctx.request;
    const { id, data } = args;

    if (!await ctx.db.exists.UserFeed({ id, user: { id: user.id } })) {
        return null;
    }

    const userFeed = await ctx.db.mutation.updateUserFeed({ data, where: { id } });

    return userFeed;
}

module.exports = updateMyFeed;
