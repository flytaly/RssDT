const moment = require('moment-timezone');
const share = require('../../mail-sender/share');

const shareNames = new Set(share.map(({ id }) => id));

async function updateMyInfo(parent, args, ctx, info) {
    const { user: { id } } = ctx.request;
    const { data } = args;
    if (data.filterShare) {
        if (!data.filterShare.every(name => shareNames.has(name))) {
            return new Error('Not valid argument: filterShare');
        }
        data.filterShare = { set: data.filterShare };
    }
    if (data.timeZone && !moment.tz.zone(data.timeZone)) {
        return new Error('Not valid argument: timeZone');
    }
    const User = await ctx.db.mutation.updateUser({ data, where: { id } }, info);

    return User;
}

module.exports = updateMyInfo;
