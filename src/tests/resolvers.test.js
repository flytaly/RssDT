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
    const user = await prisma.exists.User({ email: mocks.user.email });
    if (user) await prisma.mutation.deleteUser({ where: { email: mocks.user.email } });
};

const clearDB = async prisma => prisma.mutation.deleteUser({ where: { email: mocks.user.email } });

beforeAll(async () => {
    const server = createServer(db);
    const app = await server.start({ port: 0 });
    const { port } = app.address();
    link = new HttpLink({ uri: `http://127.0.0.1:${port}` }, fetch);
    yogaApp = app;
    await initDb(db);
});

afterAll(async () => { yogaApp.close(); await clearDB(db); });

describe('Test GraphQL mutations:', () => {
    test('should create user', async () => {
        const CREATE_USER_MUTATION = gql`mutation ($email: String!) {
            createUser(email: $email) {
              id
              email
            }
          }`;
        const { data } = await makePromise(execute(link, {
            query: CREATE_USER_MUTATION,
            variables: { email: mocks.user.email },
        }));
        expect(data.createUser).toMatchObject(mocks.user);
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
