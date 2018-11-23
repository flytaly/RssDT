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

const initDb = async (prisma) => {
    const users = [mocks.user, mocks.userWithFeed];
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

const clearDB = async prisma => initDb(prisma);

beforeAll(async () => {
    const server = createServer(db);
    const app = await server.start({ port: 0 });
    const { port } = app.address();
    link = new HttpLink({ uri: `http://127.0.0.1:${port}` }, fetch);
    yogaApp = app;
    await initDb(db);
});

afterAll(async () => {
    yogaApp.close();
    await clearDB(db);
});

describe('Test GraphQL mutations:', () => {
    test('should create user with email', async () => {
        const CREATE_USER_MUTATION = gql`mutation ($email: String!) {
            createUser(email: $email) {
              id
              email
            }
          }`;
        const { data } = await makePromise(execute(link, {
            query: CREATE_USER_MUTATION,
            variables: {
                email: mocks.user.email,
            },
        }));

        expect(data.createUser).toMatchObject(mocks.user);
    });
    test('should create user with email and feed', async () => {
        const CREATE_USER_WITH_FEED_MUTATION = gql`mutation (
            $email: String!
            $feedUrl: String!,
            $feedSchedule: DigestSchedule,
            ) {
            createUser(
                email: $email
                feedUrl: $feedUrl
                feedSchedule: $feedSchedule
            ) {
              id
              email
              feeds {
                  schedule
                  feed {
                      url
                  }
              }
            }
          }`;

        const { data: { createUser: user } } = await makePromise(execute(link, {
            query: CREATE_USER_WITH_FEED_MUTATION,
            variables: {
                email: mocks.userWithFeed.email,
                feedUrl: mocks.userWithFeed.feedUrl,
                feedSchedule: mocks.userWithFeed.feedSchedule,
            },
        }));

        expect(user).toMatchObject({
            email: mocks.userWithFeed.email,
            feeds: [{
                schedule: mocks.userWithFeed.feedSchedule,
                feed: { url: mocks.userWithFeed.feedUrl },
            }],
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
            variables: { email: mocks.user.email },
        }));
        expect(data.user).toMatchObject(mocks.user);
    });
});
