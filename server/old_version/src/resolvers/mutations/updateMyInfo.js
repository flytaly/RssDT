async function updateMyInfo(parent, args, ctx, info) {
    const { user: { id } } = ctx.request;
    const { data } = args;
    const { filterShare } = data;
    if (filterShare) { data.filterShare = { set: filterShare }; }
    const User = await ctx.db.mutation.updateUser({ data, where: { id } }, info);

    return User;
}

module.exports = updateMyInfo;
