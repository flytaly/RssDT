const { execute, makePromise } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const jwt = require('jsonwebtoken');
const gql = require('graphql-tag');
const db = require('../bind-prisma');
const { deleteData, runServer } = require('./mutations/_common');
const mocks = require('./mocks/admin-queries.mocks');

const globalData = {
    yogaApp: null,
    linkNoAuth: null,
    linkUser: null,
    linkAdmin: null,
};

const clearDB = async () => {
    await deleteData(db, { email: mocks.user.email });
    await deleteData(db, { email: mocks.admin.email });
};

const addTestData = async () => {
    const { user, admin } = mocks;
    const { id: userId } = await db.mutation.createUser({ data: user });
    const { id: adminId } = await db.mutation.createUser({ data: admin });
    globalData.userId = userId;
    globalData.adminId = adminId;
};

beforeAll(async () => {
    globalData.yogaApp = await runServer(db);
    await clearDB();
    await addTestData();

    const { port } = globalData.yogaApp.address();
    const linkOptions = { uri: `http://127.0.0.1:${port}`, fetch, credentials: 'same-origin' };
    globalData.linkNoAuth = new HttpLink({ uri: `http://127.0.0.1:${port}`, fetch });
    globalData.linkUser = new HttpLink({ ...linkOptions,
        headers: { cookie: `token=${jwt.sign({ userId: globalData.userId }, process.env.APP_SECRET)}` } });
    globalData.linkAdmin = new HttpLink({ ...linkOptions,
        headers: { cookie: `token=${jwt.sign({ userId: globalData.adminId }, process.env.APP_SECRET)}` } });
});

afterAll(async () => {
    globalData.yogaApp.close();
    await clearDB();
});

describe('Admin queries', () => {
    describe('users', () => {
        const queryFields = '{ id email permissions }';
        const USERS_QUERY = gql`query { users ${queryFields} }`;
        test('should return error if user isn\'t authenticated', async () => {
            const { errors } = await makePromise(execute(globalData.linkNoAuth, {
                query: USERS_QUERY,
            }));
            expect(errors[0]).toMatchObject({ message: 'Authentication is required' });
        });

        test('should return error if user doesn\'t have permissions', async () => {
            const { errors } = await makePromise(execute(globalData.linkUser, {
                query: USERS_QUERY,
            }));
            expect(errors[0]).toMatchObject({ message: 'Access Denied' });
        });

        test('should return users', async () => {
            const users = await db.query.users(null, queryFields);
            const { data: returnData } = await makePromise(execute(globalData.linkAdmin, {
                query: USERS_QUERY,
            }));
            expect(returnData.users).toMatchObject(users);
        });
    });
});
