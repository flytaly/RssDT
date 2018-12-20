const { getFeedStream, isFeed } = require('../../feed-parser');

async function addFeed(parent, args, ctx, info) {
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
            if (!await isFeed(feedStream)) throw new Error('Not a feed');
        } catch (e) {
            if (e.message === 'Not a feed') throw e;
            throw new Error('Couldn\'t get access to feed');
        }
    }

    const feed = await ctx.db.mutation.upsertFeed({
        where: { url },
        create: { url },
        update: {},
    });

    const userFeedExists = await ctx.db.exists.UserFeed({
        user: { email },
        feed: { url },
    });

    if (userFeedExists) throw new Error('The feed was already added');

    const createNewUserFeed = {
        create: {
            schedule,
            // TODO: add activation token
            feed: { connect: { id: feed.id } },
        },
    };

    const user = await ctx.db.mutation.upsertUser({
        where: { email },
        create: {
            email,
            permissions: { set: ['USER'] },
            feeds: createNewUserFeed,
        },
        update: {
            feeds: createNewUserFeed,
        },
    }, info);

    // TODO: send email with activation token
    // TODO: update feed and then save update time in userFeed

    return user;
}

module.exports = addFeed;
