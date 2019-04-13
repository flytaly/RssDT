async function signOut(parent, args, ctx) {
    ctx.response.clearCookie('token', { httpOnly: true });
    return { message: 'OK' };
}

module.exports = signOut;
