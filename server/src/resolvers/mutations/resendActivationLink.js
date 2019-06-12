const nanoid = require('nanoid');
const { sendConfirmSubscription } = require('../../mail-sender/dispatcher');

async function resendActivationLink(parent, args, ctx) {
    const { id } = args;
    const userFeed = await ctx.db.query.userFeed(
        { where: { id } },
        '{ activated feed { title url } user { email }  }',
    );

    if (!userFeed || userFeed.activated || !userFeed.user.email) {
        return new Error('Feed doesn\'t exist or was already activated');
    }
    const { user: { email }, feed: { title, url } } = userFeed;

    const activationToken = await nanoid(20);
    const activationTokenExpiry = new Date(Date.now() + 1000 * 3600 * 24); // 24 hours
    await ctx.db.mutation.updateUserFeed({ where: { id }, data: { activationToken, activationTokenExpiry } });

    const feedTitle = title || url;
    await sendConfirmSubscription(email, activationToken, feedTitle);

    return { message: 'OK' };
}

module.exports = resendActivationLink;
