const { execute, makePromise } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { deleteData, runServer } = require('./_common');
const db = require('../../bind-prisma');
const { DELETE_MY_FEED_MUTATION } = require('./_gql-queries');

const globalData = {
    yogaApp: null,
    userFeedId: null,
    userId: null,
    link: null,
    linkWithAuthCookies: null,
};

const moduleName = 'deleteMyFeed';
const mocks = {
    user: {
        email: `${moduleName}-testuser@test.com`,
        password: `${moduleName}-password`,
    },
    feed: {
        schedule: 'EVERYHOUR',
        url: `http://${moduleName}testfeed.com`,
    },
};

const addTestData = async () => {
    const { schedule, url } = mocks.feed;
    const email = mocks.user.email.toLowerCase();
    const createFeed = { create: { url } };
    const createUserFeed = { create: { schedule, feed: createFeed } };
    const newUser = {
        email,
        password: await bcrypt.hash(mocks.user.password, 10),
        permissions: { set: ['USER'] },
        feeds: createUserFeed,
    };
    const { id, feeds } = await db.mutation.createUser({ data: newUser }, '{ id feeds { id } }');
    globalData.userFeedId = feeds[0].id;
    globalData.userId = id;
};

const clearDB = async () => {
    await deleteData(db, { email: mocks.user.email, url: mocks.feed.url });
};


beforeAll(async () => {
    globalData.yogaApp = await runServer(db);
    await clearDB();
    await addTestData();

    const { port } = globalData.yogaApp.address();
    globalData.link = new HttpLink({ uri: `http://127.0.0.1:${port}`, fetch });
    globalData.linkWithAuthCookies = new HttpLink({
        uri: `http://127.0.0.1:${port}`,
        fetch,
        credentials: 'same-origin',
        headers: {
            cookie: `token=${jwt.sign({ userId: globalData.userId }, process.env.APP_SECRET)}`,
        },
    });
});

afterAll(async () => {
    globalData.yogaApp.close();
    await clearDB();
});

describe('', () => {
    test('should delete user\'s feed', async () => {
        const { userFeedId: id } = globalData;
        const before = await db.exists.UserFeed({ id });

        const { data: returnData } = await makePromise(execute(globalData.linkWithAuthCookies, {
            query: DELETE_MY_FEED_MUTATION,
            variables: { id },
        }));
        const after = await db.exists.UserFeed({ id });

        expect(before).toBeTruthy();
        expect(returnData.deleteMyFeed).toMatchObject({ id });
        expect(after).toBeFalsy();
    });

    test('should return error if user isn\'t authenticated', async () => {
        const { userFeedId: id } = globalData;
        const { data, errors } = await makePromise(execute(globalData.link, {
            query: DELETE_MY_FEED_MUTATION,
            variables: { id },
        }));

        expect(data).toBeNull();
        expect(errors[0].message).toEqual('Authentication is required');
    });
});
