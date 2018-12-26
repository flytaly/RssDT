const nanoid = require('nanoid');
const { getFeedStream, checkFeedInfo } = require('../../feed-parser');
const { filterMeta } = require('../../feed-watcher/utils');
const logger = require('../../logger');
const { sendConfirmSubscription } = require('../../mail-sender/dispatcher');

async function addFeed(parent, args, ctx, info) {
    let feedMeta = {};
    const { feedSchedule: schedule } = args;
    const email = args.email.trim().toLowerCase();
    const url = args.feedUrl.trim().toLowerCase();

    if (!url) { // TODO: add additional validations
        throw new Error('Not valid argument: feedUrl');
    }
    if (!email) { // TODO: add additional validations
        throw new Error('Not valid argument: email');
    }

    // check if url is a valid feed before adding it to db
    if (!await ctx.db.exists.Feed({ url })) {
        try {
            const feedStream = await getFeedStream(url, { timeout: 3000 });
            const { isFeed, meta } = await checkFeedInfo(feedStream);

            if (!isFeed) throw new Error('Not a feed');

            feedMeta = meta;
        } catch (e) {
            if (e.message === 'Not a feed') throw e;
            throw new Error('Couldn\'t get access to feed');
        }
    }

    const feed = await ctx.db.mutation.upsertFeed({
        where: { url },
        create: { url, ...filterMeta(feedMeta) },
        update: {},
    });
    if (!feed) throw new Error(`Couldn't save feed ${url}`);

    const userFeedExists = await ctx.db.exists.UserFeed({
        user: { email },
        feed: { url },
    });
    if (userFeedExists) throw new Error('The feed was already added');

    const activationToken = await nanoid(20);
    const createNewUserFeed = {
        create: {
            schedule,
            activationToken,
            activationTokenExpiry: new Date(Date.now() + 1000 * 3600 * 24), // 24 hours
            feed: { connect: { id: feed.id } },
        },
    };

    let user;
    try {
        user = await ctx.db.mutation.upsertUser({
            where: { email },
            create: {
                email,
                permissions: { set: ['USER'] },
                feeds: createNewUserFeed,
            },
            update: {
                feeds: createNewUserFeed,
            },
        });
    } catch (e) {
        logger.error(e);
    }
    if (!user) throw new Error(`Couldn't save feed to user ${email}`);

    const title = feedMeta.title ? feedMeta.title : url;
    await sendConfirmSubscription(email, activationToken, title);

    return { message: `Activation link has been sent to ${email}` };
}

module.exports = addFeed;
