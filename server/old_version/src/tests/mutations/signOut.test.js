/* eslint-env jest */
const { execute, makePromise } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const { runServer } = require('./_common');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');

let yogaApp;
let linkCustomFetch;
let cookies;
const watcher = {};


beforeAll(async () => {
    yogaApp = await runServer(db, watcher);
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

afterAll(async () => {
    yogaApp.close();
});

describe('signIn', () => {
    const parseCookies = c => c.split(';').reduce((acc, curr) => {
        const pair = curr.trim();
        const [key, value] = pair.split('=');
        acc[key] = value;
        return acc;
    }, {});

    test('should clear token in cookies', async () => {
        const operation = {
            query: gq.SIGNOUT_MUTATION,
        };
        const { data, errors } = await makePromise(execute(linkCustomFetch, operation));
        expect(data.signOut).toMatchObject({ message: 'OK' });
        expect(errors).toBeUndefined();
        const parsed = parseCookies(cookies);
        expect(parsed).toHaveProperty('token', '');
    });
});
