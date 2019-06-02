const nanoid = require('nanoid');
const { sendUnsubscribe } = require('../../mail-sender/dispatcher');

async function requestUnsubscribe(parent, args, ctx) {
    const { id } = args;

    const userFeed = await ctx.db.query.userFeed({ where: { id } }, '{ id feed { title url } user { email } }');
    if (!userFeed) {
        // throw new Error(`There is no account for email ${email}`);
        return new Error('Feed doesn\'t exist');
    }

    const { user: { email }, feed: { title, url } } = userFeed;
    const unsubscribeToken = await nanoid(20);
    const unsubscribeTokenExpiry = new Date(Date.now() + 1000 * 3600 * 24); // 24 hours
    await ctx.db.mutation.updateUserFeed({
        where: { id },
        data: { unsubscribeToken, unsubscribeTokenExpiry },
    });

    (async () => sendUnsubscribe(email, unsubscribeToken, title || url))();

    return { message: 'OK' };
}


module.exports = requestUnsubscribe;
