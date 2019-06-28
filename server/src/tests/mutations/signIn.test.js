/* eslint-env jest */

const { execute, makePromise } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { deleteData, runServer } = require('./_common');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');

let yogaApp;
let linkCustomFetch;
let cookies;
const watcher = {};

const moduleName = 'signin';
const mocks = {
    user: {
        email: `${moduleName}-testuser@test.com`,
        password: `${moduleName}_password`,
    },
};

jest.mock('nanoid', () => jest.fn(async () => mocks.activationToken));

const clearDB = async () => {
    await deleteData(db, { email: mocks.user.email });
};

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
    await clearDB();

    const password = await bcrypt.hash(mocks.user.password, 10);
    await db.mutation.createUser({ data: { ...mocks.user, password } });
});

afterAll(async () => {
    yogaApp.close();
    await clearDB();
});

describe('signIn', () => {
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
        expect(data).toBeNull();
        expect(errors.length).toEqual(1);
        expect(errors[0].message).toEqual('Invalid Password!');
    });
    test('should return error if email is invalid', async () => {
        const { password } = mocks.user;
        const email = 'wrongemail';
        const operation = {
            query: gq.SIGNIN_MUTATION,
            variables: { email, password },
        };
        const { data, errors } = await makePromise(execute(linkCustomFetch, operation));
        expect(cookies).toBeNull();
        expect(data).toBeNull();
        expect(errors.length).toEqual(1);
        expect(errors[0].message).toEqual(`There is no account for email ${email}`);
    });
});
