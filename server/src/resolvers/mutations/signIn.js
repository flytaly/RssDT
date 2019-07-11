const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signIn(parent, args, ctx) {
    const { email, password } = args;
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
        return new Error(`There is no account for email ${email}`);
    }
    const validPassword = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!validPassword) {
        return new Error('Invalid Password!');
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    const domain = process.env.COOKIE_DOMAIN;
    // http://expressjs.com/en/api.html#res.cookie
    ctx.response.cookie('token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 180,
        httpOnly: true,
        secure: true,
        ...(domain ? { domain } : {}),
    });

    return { message: 'OK' };
}

module.exports = signIn;
