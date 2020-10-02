const isDev = process.env.NODE_ENV === 'development';

async function signOut(parent, args, ctx) {
    const domain = process.env.COOKIE_DOMAIN;
    ctx.response.clearCookie('token', {
        httpOnly: true,
        secure: !isDev,
        ...(domain ? { domain } : {}),
    });
    return { message: 'OK' };
}

module.exports = signOut;
