const faker = require('faker/locale/en');
const db = require('../../bind-prisma');
const transport = require('../../mail-sender/transport');
const { generateFeed, generateFeedItems } = require('../mocks/feed-generator');
const periods = require('../../periods');
const { buildAndSendDigests } = require('../../mail-sender/dispatcher');
const { isFeedReady } = require('../../mail-sender/is-feed-ready');
const { setUserFeedLastUpdate } = require('../../db-queries');
const { composeHTML } = require('../../mail-sender/composeMail');
const periodsNames = require('../../periods-names');

jest.mock('../../mail-sender/transport.js', () => ({
    sendMail: jest.fn(async () => ({})),
}));

jest.mock('../../mail-sender/is-feed-ready.js', () => ({
    isFeedReady: jest.fn(() => true),
}));

jest.mock('../../mail-sender/composeMail.js', () => ({
    composeHTML: jest.fn(() => ({ html: 'OK', errors: [] })),
}));

const deleteUser = async email => db.mutation.deleteUser({ where: { email } });
const deleteFeed = async url => db.mutation.deleteFeed({ where: { url } });

describe('Build digest', () => {
    const data = {};

    beforeAll(async () => {
        faker.seed(33);
        const feedItems = generateFeedItems({ startDate: '2019-05-30T19:00:00.000Z', count: 3 });
        const feed = { ...generateFeed(), items: { create: feedItems } };
        const userFeeds = [
            { schedule: periods.EVERY3HOURS, activated: true, feed: { create: feed } }];
        data.urls = [feed.url];
        data.feedItems = feedItems;
        const user = {
            email: faker.internet.email(),
            feeds: { create: userFeeds },
        };
        data.user = await db.mutation.createUser({ data: user });
    });

    afterEach(jest.clearAllMocks);

    afterAll(async () => {
        await deleteUser(data.user.email);
        await Promise.all(data.urls.map(url => deleteFeed(url)));
    });


    test('should build and send digest with ALL ITEMS', async () => {
        const url = data.urls[0];
        const feed = await db.query.feed({ where: { url } }, '{ title userFeeds { id activated schedule } }');
        const userFeed = feed.userFeeds[0];
        const lastUpdate = new Date(Date.now() - 3600000 * 24);
        await setUserFeedLastUpdate(userFeed.id, lastUpdate);

        await buildAndSendDigests(url);
        const userFeedAfter = await db.query.userFeed(
            { where: { id: userFeed.id } },
            '{ id lastUpdate schedule withContentTable user { email locale timeZone shareEnable filterShare dailyDigestHour withContentTableDefault } }',
        );
        expect(isFeedReady).toHaveBeenCalled();
        expect(isFeedReady.mock.calls[0][0]).toMatchObject({ id: userFeed.id });

        expect(composeHTML.mock.calls[0][1]).toHaveLength(data.feedItems.length);
        expect(composeHTML).toHaveBeenCalledWith(
            expect.objectContaining({ title: feed.title }),
            expect.arrayContaining(data.feedItems.map(({ title }) => expect.objectContaining({ title }))),
            expect.objectContaining({ ...userFeedAfter, lastUpdate: lastUpdate.toISOString() }),
        );
        expect(transport.sendMail).toHaveBeenCalledWith(expect.objectContaining({
            from: process.env.MAIL_FROM,
            to: data.user.email,
            subject: `${feed.title}: ${periodsNames[userFeed.schedule]} digest`,
            html: 'OK',
        }));
    });

    test('should not build digest if there are NO NEW ITEMS', async () => {
        const url = data.urls[0];
        const feed = await db.query.feed({ where: { url } },
            '{ userFeeds { id } }');
        const userFeed = feed.userFeeds[0];
        await setUserFeedLastUpdate(userFeed.id, new Date(Date.now()));
        await buildAndSendDigests(url);
        expect(isFeedReady).toHaveBeenCalled();
        expect(composeHTML).not.toHaveBeenCalled();
        expect(transport.sendMail).not.toHaveBeenCalled();
    });

    test('should build digest with ONLY NEW ITEMS', async () => {
        const newItems = generateFeedItems({ count: 4 });
        const url = data.urls[0];
        const feed = await db.query.feed({ where: { url } }, '{ title userFeeds { id } }');
        const userFeed = feed.userFeeds[0];
        const lastUpdate = new Date(Date.now());
        await setUserFeedLastUpdate(userFeed.id, lastUpdate);
        await db.mutation.updateFeed({
            where: { url },
            data: { items: { create: newItems } },
        });
        await buildAndSendDigests(url);
        const userFeedAfter = await db.query.userFeed(
            { where: { id: userFeed.id } },
            '{ id lastUpdate schedule withContentTable user { email locale timeZone shareEnable filterShare dailyDigestHour withContentTableDefault} }',
        );
        expect(composeHTML.mock.calls[0][1]).toHaveLength(newItems.length);
        expect(composeHTML).toHaveBeenCalledWith(
            expect.objectContaining({ title: feed.title }),
            expect.arrayContaining(newItems.map(({ title }) => expect.objectContaining({ title }))),
            expect.objectContaining({ ...userFeedAfter, lastUpdate: lastUpdate.toISOString() }),
        );
        expect(transport.sendMail).toHaveBeenCalled();
    });
});
