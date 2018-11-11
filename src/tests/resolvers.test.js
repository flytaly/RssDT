/* eslint-env jest */
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const gql = require('graphql-tag');
const { execute, makePromise } = require('apollo-link');
const mocks = require('./mocks/graphql_mocks');
const createServer = require('../server');

let yogaApp;
let link;
const db = {
    query: {
        user: jest.fn(async () => mocks.user),
    },
    mutation: {
        createUser: jest.fn(async () => mocks.user),
    },
};

beforeAll(async () => {
    const server = createServer(db);
    const app = await server.start({ port: 0 });
    const { port } = app.address();
    link = new HttpLink({ uri: `http://127.0.0.1:${port}` }, fetch);
    yogaApp = app;
});

afterAll(async () => yogaApp.close());

describe('Test GraphQL queries:', () => {
    test('should return user', async () => {
        const operation = {
            query: gql`query {
                user(where: { email: "${mocks.user.email}" }) {
                    email
                    id
                }
            }`,
        };
        const { data } = await makePromise(execute(link, operation));
        expect(db.query.user).toHaveBeenCalled();
        // expect(db.query.user.mock.calls[0][0]).toEqual({ where: { email: mocks.user.email } });
        // expect(db.query.user.mock.calls[0][1]).toHaveProperty('fieldName', 'user');
        expect(data.user).toEqual(mocks.user);
    });
});

describe('Test GraphQL mutations:', () => {
    test('should create user', async () => {
        const operation = {
            query: gql`mutation m {
                createUser(email: "${mocks.user.email}") {
                  id
                  email
                }
              }
              `,
        };
        const { data } = await makePromise(execute(link, operation));
        expect(db.mutation.createUser).toHaveBeenCalled();
        // expect(db.mutation.createUser.mock.calls[0][0]).toEqual({ data: { email: mocks.user.email } });
        expect(data.createUser).toEqual(mocks.user);
    });
});
