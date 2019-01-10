/* eslint-env jest */
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { execute, makePromise } = require('apollo-link');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('../bind-prisma');
const mocks = require('./mocks/mutations.mocks');
const createServer = require('../server');
const gq = require('./gql-queries');
const { sendConfirmSubscription } = require('../mail-sender/dispatcher');

let yogaApp;
let link;

jest.mock('../feed-parser', () => ({
    getFeedStream: jest.fn((url) => {
        if (url === mocks.addNotAFeed.feedUrl) return 'fakeFeedStream';
        return 'feedStream';
    }),
    checkFeedInfo: jest.fn(stream => ({
        isFeed: stream === 'feedStream',
        meta: { title: mocks.feedTitle },
    })),
}));

jest.mock('../mail-sender/dispatcher.js', () => ({
    sendConfirmSubscription: jest.fn(() => Promise.resolve()),
}));

jest.mock('nanoid', () => jest.fn(async () => mocks.activationToken));

const clearTestDB = async (prisma) => {
    const users = [mocks.addFeed, mocks.addNewFeed];
    return Promise.all(users.map(async ({ email, feedUrl: url = '' }) => {
        const userExists = await prisma.exists.User({ email });
        const feedExists = await prisma.exists.Feed({ url });
        if (userExists) {
            await prisma.mutation.deleteUser({ where: { email } });
        }
        if (feedExists) {
            await prisma.mutation.deleteFeed({ where: { url } });
        }
    }));
};

const watcher = {
    updateFeed: jest.fn(async () => 10),
    setFeedUpdateTime: jest.fn(async () => null),
};

beforeAll(async () => {
    const server = createServer(db, watcher);
    server.express.use(cookieParser());

    const app = await server.start({ port: 0 });
    const { port } = app.address();

    link = new HttpLink({
        uri: `http://127.0.0.1:${port}`,
        fetch,
        credentials: 'same-origin',
    });

    yogaApp = app;
    await clearTestDB(db);
});

afterAll(async () => {
    yogaApp.close();
    await clearTestDB(db);
});

describe('Test GraphQL mutations:', () => {
    describe('addFeed mutation', () => {
        test('should create user with email and feed', async () => {
            const { email, feedUrl, feedSchedule } = mocks.addFeed;
            const { data: { addFeed: { message } }, errors } = await makePromise(execute(link, {
                query: gq.ADD_FEED_MUTATION,
                variables: { email, feedUrl, feedSchedule },
            }));
            const user = await db.query.user({ where: { email } }, '{ email permissions feeds { schedule activated activationToken feed { url } }  }');
            expect(errors).toBeUndefined();
            expect(message).toEqual(`Activation link has been sent to ${email.toLowerCase()}`);
            expect(user).toMatchObject({
                email: mocks.addFeed.email.toLowerCase(),
                permissions: ['USER'],
                feeds: [{
                    schedule: mocks.addFeed.feedSchedule,
                    activated: false,
                    activationToken: mocks.activationToken,
                    feed: { url: mocks.addFeed.feedUrl.toLowerCase() },
                }],
            });
            expect(sendConfirmSubscription).toHaveBeenCalledWith(email.toLowerCase(), mocks.activationToken, mocks.feedTitle);
        });

        test('should add new feed to existing user', async () => {
            const { email, feedUrl, feedSchedule } = mocks.addNewFeed;
            const { data: { addFeed: { message } }, errors } = await makePromise(execute(link, {
                query: gq.ADD_FEED_MUTATION,
                variables: { email, feedUrl, feedSchedule },
            }));
            const user = await db.query.user({ where: { email } }, '{ feeds { schedule feed { url } }  }');
            expect(errors).toBeUndefined();
            expect(message).toEqual(`Activation link has been sent to ${mocks.addNewFeed.email.toLowerCase()}`);
            expect(user.feeds.length).toEqual(2);
            expect(user.feeds[1]).toMatchObject({
                schedule: mocks.addNewFeed.feedSchedule,
                feed: { url: mocks.addNewFeed.feedUrl.toLowerCase() },
            });
        });

        test('should return error if adding existing feed', async () => {
            const { errors } = await makePromise(execute(link, {
                query: gq.ADD_FEED_MUTATION,
                variables: {
                    email: mocks.addFeed.email,
                    feedUrl: mocks.addFeed.feedUrl,
                    feedSchedule: mocks.addFeed.feedSchedule,
                },
            }));
            expect(errors[0].message).toEqual('The feed was already added');
        });

        test('should return error if adding not a feed', async () => {
            const { errors } = await makePromise(execute(link, {
                query: gq.ADD_FEED_MUTATION,
                variables: {
                    email: mocks.addNotAFeed.email,
                    feedUrl: mocks.addNotAFeed.feedUrl,
                    feedSchedule: mocks.addNotAFeed.feedSchedule,
                },
            }));
            expect(errors[0].message).toEqual('Not a feed');
        });
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
            const { email, feedUrl: url } = mocks.addFeed;
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
            const { email, feedUrl: url } = mocks.addFeed;
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
            const { email, feedUrl: url } = mocks.addFeed;
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

    describe('requestPasswordChange', () => {
        test('should generate token and token\'s expiry', async () => {
            const { email } = mocks.user;
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
        });
    });

    describe('setPassword', () => {
        test('should save password\'s hash', async () => {
            const { email, password } = mocks.user;
            const { setPasswordToken: token } = await db.query.user({ where: { email } });

            const { data } = await makePromise(execute(link, {
                query: gq.SET_PASSWORD_MUTATION,
                variables: { email, password, token },
            }));
            expect(data.setPassword.email).toEqual(email.toLowerCase());

            const user = await db.query.user({ where: { email } });
            const validPassword = await bcrypt.compare(password, user.password);

            expect(validPassword).toBeTruthy();
            expect(user.setPasswordToken).toBeNull();
            expect(user.setPasswordTokenExpiry).toBeNull();
        });
    });

    describe('signIn', () => {
        let cookies;
        let linkCustomFetch;

        beforeAll(() => {
            const { port } = yogaApp.address();
            const customFetch = async (uri, options) => {
                const res = await fetch(uri, options);
                cookies = res.headers.get('set-cookie');
                return res;
            };
            linkCustomFetch = new HttpLink({
                uri: `http://127.0.0.1:${port}`,
                fetch: customFetch,
                credentials: 'same-origin',
            });
        });

        const parseCookies = c => c.split(';').reduce((acc, curr) => {
            const pair = curr.trim();
            const [key, value] = pair.split('=');
            acc[key] = value;
            return acc;
        }, {});
        test('should return token in cookies', async () => {
            const { email, password } = mocks.user;
            const operation = {
                query: gq.SIGNIN_MUTATION,
                variables: { email, password },
            };
            const { data, errors } = await makePromise(execute(linkCustomFetch, operation));
            expect(data.signIn).toMatchObject({ message: 'OK' });
            expect(errors).toBeUndefined();
            const userFromDB = await db.query.user({ where: { email } }, '{ id }');
            const parsed = parseCookies(cookies);
            const { userId } = jwt.verify(parsed.token, process.env.APP_SECRET);

            expect(parsed['Max-Age']).toEqual(String(60 * 60 * 24 * 180)); // in seconds
            expect(userId).toEqual(userFromDB.id);
        });
        test('should return error if password is invalid', async () => {
            const { email } = mocks.user;
            const password = 'wrongPassword';
            const operation = {
                query: gq.SIGNIN_MUTATION,
                variables: { email, password },
            };
            const { data, errors } = await makePromise(execute(linkCustomFetch, operation));
            expect(cookies).toBeNull();
            expect(data.signIn).toBeNull();
            expect(errors.length).toEqual(1);
            expect(errors[0].message).toEqual('Invalid Password!');
        });
        test('should return error if email is invalid', async () => {
            const { password } = mocks.user;
            const email = 'wrongEmail';
            const operation = {
                query: gq.SIGNIN_MUTATION,
                variables: { email, password },
            };
            const { data, errors } = await makePromise(execute(linkCustomFetch, operation));
            expect(cookies).toBeNull();
            expect(data.signIn).toBeNull();
            expect(errors.length).toEqual(1);
            expect(errors[0].message).toEqual(`There is no account for email ${email}`);
        });
    });
});
