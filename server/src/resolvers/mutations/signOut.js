async function signOut(parent, args, ctx) {
    const domain = process.env.COOKIE_DOMAIN;
    ctx.response.clearCookie('token', {
        httpOnly: true,
        secure: true,
        ...(domain ? { domain } : {}),
    });
    return { message: 'OK' };
}

module.exports = signOut;
