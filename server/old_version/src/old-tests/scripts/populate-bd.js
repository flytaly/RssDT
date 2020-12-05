/*
    Uncomment a function and run this script with command:
    dotenv -e .env.dev -- node ./src/tests/scripts/populate-bd.js
*/

const db = require('../../bind-prisma');
const { generateFeed, generateFeedItems } = require('../mocks/feed-generator');

const emailPrefix = 'test-user@test';
const urlPrefix = 'http://testurl';
let totalFeedNumber = 0;

const generateFeedWithItems = (feedsNumber, itemsPerFeed) => {
    const feeds = [];
    for (let i = 0; i < feedsNumber; i += 1) {
        const feedItems = generateFeedItems({ count: itemsPerFeed });
        const feed = generateFeed(false);
        totalFeedNumber += 1;
        feed.url = `${urlPrefix}${totalFeedNumber}.test`;
        feed.items = { create: feedItems };
        feeds.push({ feed: { create: feed } });
    }
    return feeds;
};

const createUsersWithFeeds = async (usersNumber = 50, feedsPerUser = 6, itemsPerFeed = 50) => {
    const emails = [];
    for (let i = 0; i < usersNumber; i += 1) {
        const email = `${emailPrefix}${i}.test`;
        emails.push(email);
    }

    try {
        await Promise.all(emails.map((email) => {
            const data = {
                email,
                permissions: { set: ['USER'] },
                feeds: {
                    create: generateFeedWithItems(feedsPerUser, itemsPerFeed),
                },
            };
            return db.mutation.createUser({ data });
        }));
        console.log(`Create ${usersNumber} users with ${feedsPerUser} feeds each`);
    } catch (e) { console.error(e); }
};

const deleteCreatedUsers = async () => {
    const { count: countUsers } = await db.mutation.deleteManyUsers({
        where: {
            email_starts_with: emailPrefix,
        },
    });
    const { count: countFeeds } = await db.mutation.deleteManyFeeds({
        where: {
            url_starts_with: urlPrefix,
        },
    });
    console.log(`Delete ${countUsers} users with email starting with ${emailPrefix}`);
    console.log(`Delete ${countFeeds} feeds with url starting with ${urlPrefix}`);
};

// createUsersWithFeeds();
deleteCreatedUsers();

module.exports = {
    createUsersWithFeeds, deleteCreatedUsers,
};
