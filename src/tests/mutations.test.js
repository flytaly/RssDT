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

let yogaApp;
let link;

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

beforeAll(async () => {
    const server = createServer(db);
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
    describe('addFeed mutations', () => {
        test('should create user with email and feed', async () => {
            const { data: { addFeed: user } } = await makePromise(execute(link, {
                query: gq.ADD_FEED_MUTATION,
                variables: {
                    email: mocks.addFeed.email,
                    feedUrl: mocks.addFeed.feedUrl,
                    feedSchedule: mocks.addFeed.feedSchedule,
                },
            }));

            expect(user).toMatchObject({
                email: mocks.addFeed.email.toLowerCase(),
                permissions: ['USER'],
                feeds: [{
                    schedule: mocks.addFeed.feedSchedule,
                    feed: { url: mocks.addFeed.feedUrl.toLowerCase() },
                }],
            });
        });

        test('should add new feed to existing user', async () => {
            const { data: { addFeed: user } } = await makePromise(execute(link, {
                query: gq.ADD_FEED_MUTATION,
                variables: {
                    email: mocks.addNewFeed.email,
                    feedUrl: mocks.addNewFeed.feedUrl,
                    feedSchedule: mocks.addNewFeed.feedSchedule,
                },
            }));

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
