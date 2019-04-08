/* eslint-env jest */

const { execute, makePromise } = require('apollo-link');
const { sendSetPasswordLink } = require('../../mail-sender/dispatcher');
const { deleteData, runServer, getApolloLink } = require('./_common');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');

let yogaApp;
let link;
const watcher = {};

const moduleName = 'requestPasswordChange';
const mocks = {
    user: {
        email: `${moduleName}TestUser@test.com`,
        password: `${moduleName}_password`,
    },
    feed: {
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
jest.mock('../../mail-sender/dispatcher.js', () => ({
    sendSetPasswordLink: jest.fn(() => Promise.resolve()),
}));

const clearDB = async () => {
    await deleteData(db, { email: mocks.feed.email, url: mocks.feed.feedUrl });
};

beforeAll(async () => {
    yogaApp = await runServer(db, watcher);
    const { port } = yogaApp.address();
    link = getApolloLink(port);
    await clearDB();

    const { email, feedUrl, feedSchedule } = mocks.feed;
    await makePromise(execute(link, {
        query: gq.ADD_FEED_MUTATION,
        variables: { email, feedUrl, feedSchedule },
    }));
});

afterAll(async () => {
    yogaApp.close();
    await clearDB();
});

describe('requestPasswordChange', () => {
    test('should generate token and token\'s expiry', async () => {
        const { email } = mocks.feed;
        const { data: { requestPasswordChange: message } } = await makePromise(execute(link, {
            query: gq.REQUEST_PASSWORD_CHANGE_MUTATION,
            variables: { email },
        }));

        expect(message).toMatchObject({ message: 'OK' });
        const { setPasswordToken, setPasswordTokenExpiry } = await db.query.user({ where: { email } });
        expect(setPasswordToken).not.toBeNull();
        expect(setPasswordToken.length >= 16).toBeTruthy();
        expect(setPasswordTokenExpiry).not.toBeNull();
        expect(Date.now() + 1000 * 3600 * 12 - new Date(setPasswordTokenExpiry)).toBeGreaterThanOrEqual(0);
        expect(sendSetPasswordLink).toHaveBeenCalledWith(email, setPasswordToken);
    });
});
