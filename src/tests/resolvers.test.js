/* eslint-env jest */
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const gql = require('graphql-tag');
const { execute, makePromise } = require('apollo-link');
const db = require('../bind-prisma');
const mocks = require('./mocks/graphql_mocks');
const createServer = require('../server');

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
    const app = await server.start({ port: 0 });
    const { port } = app.address();
    link = new HttpLink({ uri: `http://127.0.0.1:${port}` }, fetch);
    yogaApp = app;
    await clearTestDB(db);
});

afterAll(async () => {
    yogaApp.close();
    await clearTestDB(db);
});

describe('Test GraphQL mutations:', () => {
    describe('addFeed mutations', () => {
        const ADD_FEED_MUTATION = gql`mutation (
        $email: String!
        $feedUrl: String!,
        $feedSchedule: DigestSchedule,
        ) {
        addFeed(
            email: $email
            feedUrl: $feedUrl
            feedSchedule: $feedSchedule
        ) {
          id
          email
          permissions
          feeds {
              schedule
              feed {
                  url
              }
          }
        }
      }`;
        test('should create user with email and feed', async () => {
            const { data: { addFeed: user } } = await makePromise(execute(link, {
                query: ADD_FEED_MUTATION,
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
                query: ADD_FEED_MUTATION,
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
                query: ADD_FEED_MUTATION,
                variables: {
                    email: mocks.addFeed.email,
                    feedUrl: mocks.addFeed.feedUrl,
                    feedSchedule: mocks.addFeed.feedSchedule,
                },
            }));
            expect(errors[0].message).toEqual('The feed was already added');
        });
    });
});


describe('Test GraphQL queries:', () => {
    test('should return user', async () => {
        const USER_QUERY = gql`query ($email: String!) {
            user(where: { email: $email }) {
                email
                id
            }
        }`;

        const { data } = await makePromise(execute(link, {
            query: USER_QUERY,
            variables: { email: mocks.addFeed.email },
        }));
        expect(data.user.email).toEqual(mocks.addFeed.email.toLowerCase());
    });
});
