const nanoid = require('nanoid');
const { sendSetPasswordLink } = require('../../mail-sender/dispatcher');

async function requestPasswordChange(parent, args, ctx) {
    const { email } = args;
    const userExists = await ctx.db.exists.User({ email });
    if (!userExists) {
        // throw new Error(`There is no account for email ${email}`);
        return { message: 'OK' };
    }
    const setPasswordToken = await nanoid(20);
    const setPasswordTokenExpiry = new Date(Date.now() + 1000 * 3600 * 12); // 12 hours
    await ctx.db.mutation.updateUser({
        where: { email },
        data: { setPasswordToken, setPasswordTokenExpiry },
    });

    (async () => sendSetPasswordLink(email, setPasswordToken))();

    return { message: 'OK' };
}


module.exports = requestPasswordChange;
