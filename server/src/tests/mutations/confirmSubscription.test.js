/* eslint-env jest */

const { execute, makePromise } = require('apollo-link');
const { deleteData, runServer, getApolloLink } = require('./_common');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');

let yogaApp;
let link;
const watcher = {
    updateFeed: jest.fn(async () => 10),
    setFeedUpdateTime: jest.fn(async () => null),
};

const moduleName = 'confirmsubscription';
const mocks = {
    confirmFeed: {
        email: `${moduleName}TestUser@test.com`,
        feedUrl: `http://${moduleName}testfeed.com`,
        feedSchedule: 'EVERY2HOURS',
    },
    activationToken: `---${moduleName}-activation-token---`,
    feedTitle: 'Test Feed Title',
};
jest.mock('../../feed-parser', () => ({
    getFeedStream: jest.fn(() => true),
    checkFeedInfo: jest.fn(() => ({
        isFeed: true,
        meta: { title: mocks.feedTitle },
    })),
}));
jest.mock('nanoid', () => jest.fn(async () => mocks.activationToken));

const clearDB = async () => {
    await deleteData(db, { email: mocks.confirmFeed.email, url: mocks.confirmFeed.feedUrl });
};

beforeAll(async () => {
    yogaApp = await runServer(db, watcher);
    const { port } = yogaApp.address();
    link = getApolloLink(port);
    await clearDB();

    const { email, feedUrl, feedSchedule } = mocks.confirmFeed;
    await makePromise(execute(link, {
        query: gq.ADD_FEED_MUTATION,
        variables: { email, feedUrl, feedSchedule },
    }));
});

afterAll(async () => {
    yogaApp.close();
    await clearDB();
});

describe('confirmSubscription mutation', () => {
    const DateOriginal = Date;

    function mockDate(date) {
        global.Date = class extends DateOriginal {
            constructor(...args) {
                if (args.length) return new DateOriginal(...args);
                return new DateOriginal(date);
            }
        };
    }

    afterEach(() => {
        global.Date = DateOriginal;
    });

    test('should not activate feed with wrong token', async () => {
        const { email, feedUrl: url } = mocks.confirmFeed;
        const userFeeds = await db.query.userFeeds({
            where: {
                user: { email },
                feed: { url },
                activationToken: mocks.activationToken,
            },
        }, '{ id }');
        expect(userFeeds.length).toBeGreaterThan(0);

        const { errors } = await makePromise(execute(link, {
            query: gq.CONFIRM_SUBSCRIPTION_MUTATION,
            variables: { email, token: 'fakeToken' },
        }));
        const userFeed = await db.query.userFeed({
            where: {
                id: userFeeds[0].id,
            },
        });
        expect(errors[0].message).toEqual('Wrong or expired token');
        expect(userFeed.activationToken).toEqual(mocks.activationToken);
        expect(userFeed.activated).toBeFalsy();
    });

    test('should not activate feed with expired token', async () => {
        const { email, feedUrl: url } = mocks.confirmFeed;
        const userFeeds = await db.query.userFeeds({
            where: {
                user: { email },
                feed: { url },
                activationToken: mocks.activationToken,
            },
        }, '{ id }');
        expect(userFeeds.length).toBeGreaterThan(0);
        mockDate(Date.now() + 1000 * 3600 * 26);
        const { errors } = await makePromise(execute(link, {
            query: gq.CONFIRM_SUBSCRIPTION_MUTATION,
            variables: { email, token: mocks.activationToken },
        }));
        const userFeed = await db.query.userFeed({
            where: {
                id: userFeeds[0].id,
            },
        });
        expect(errors[0].message).toEqual('Wrong or expired token');
        expect(userFeed.activationToken).toEqual(mocks.activationToken);
        expect(userFeed.activated).toBeFalsy();
    });

    test('should activate feed', async () => {
        const { email, feedUrl: url } = mocks.confirmFeed;
        const userFeeds = await db.query.userFeeds({
            where: {
                user: { email },
                feed: { url },
                activationToken: mocks.activationToken,
            },
        }, '{ id }');
        expect(userFeeds.length).toBeGreaterThan(0);
        const { data: { confirmSubscription: { message } } } = await makePromise(execute(link, {
            query: gq.CONFIRM_SUBSCRIPTION_MUTATION,
            variables: { email, token: mocks.activationToken },
        }));
        const userFeed = await db.query.userFeed({
            where: {
                id: userFeeds[0].id,
            },
        });
        expect(message).toEqual(`Feed "${mocks.feedTitle}" was activated`);
        expect(userFeed.activationToken).toBeNull();
        expect(userFeed.activated).toBeTruthy();
        expect(watcher.updateFeed).toHaveBeenCalledWith(url);
        expect(watcher.setFeedUpdateTime).toHaveBeenCalledWith(url);
    });
});
