async function unsubscribe(parent, args, ctx) {
    const { token } = args;

    if (!await ctx.db.exists.UserFeed({
        unsubscribeToken: token,
        unsubscribeTokenExpiry_gte: new Date(),
    })) {
        throw new Error('The token is invalid or expired');
    }

    const userFeed = await ctx.db.mutation.deleteUserFeed({
        where: { unsubscribeToken: token },
    });

    return userFeed;
}

module.exports = unsubscribe;
