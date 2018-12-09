const nanoid = require('nanoid');

async function requestPasswordChange(parent, args, ctx, info) {
    const { email } = args;
    const userExists = await ctx.db.exists.User({ email });
    if (!userExists) {
        throw new Error(`There is no account for email ${email}`);
    }
    const setPasswordToken = await nanoid(20);
    const setPasswordTokenExpiry = new Date(Date.now() + 1000 * 3600 * 12); // 12 hours
    const user = await ctx.db.mutation.updateUser({
        where: { email },
        data: { setPasswordToken, setPasswordTokenExpiry },
    });

    // TODO: send email with token

    return { message: 'OK' };
}


module.exports = requestPasswordChange;
