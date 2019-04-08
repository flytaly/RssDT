const bcrypt = require('bcrypt');

const saltRounds = 10;

async function setPassword(parent, args, ctx) {
    const { token, /* email, */ password: plainPassword } = args;
    /* if (!await ctx.db.exists.User({ email })) {
        throw new Error(`There is no account for email ${email}`);
    } */
    if (!await ctx.db.exists.User({
        setPasswordToken: token,
        setPasswordTokenExpiry_gte: new Date(Date.now() - 3600000 * 12),
    })) {
        throw new Error('The token is invalid or expired');
    }

    const password = await bcrypt.hash(plainPassword, saltRounds);
    const updatedUser = await ctx.db.mutation.updateUser({
        where: { setPasswordToken: token },
        data: {
            password,
            setPasswordToken: null,
            setPasswordTokenExpiry: null,
        },
    });

    return updatedUser;
}


module.exports = setPassword;
