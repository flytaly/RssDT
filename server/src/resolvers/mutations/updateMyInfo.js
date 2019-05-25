const moment = require('moment-timezone');

async function updateMyInfo(parent, args, ctx) {
    const { user: { id } } = ctx.request;
    const { data } = args;

    if (data.timeZone && !moment.tz.zone(data.timeZone)) {
        return new Error('Not valid argument: timeZone');
    }
    const User = await ctx.db.mutation.updateUser({ data, where: { id } });

    return User;
}

module.exports = updateMyInfo;
