const { execute, makePromise } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { deleteData, runServer } = require('./_common');
const db = require('../../bind-prisma');
const { UPDATE_MY_INFO_MUTATION } = require('./_gql-queries');

const globalData = {
    yogaApp: null,
    userId: null,
    link: null,
    linkWithAuthCookies: null,
};

const moduleName = 'updateMyInfo';
const mocks = {
    user: {
        email: `${moduleName}-testuser@test.com`,
        password: `${moduleName}-password`,
    },
};

const addTestData = async () => {
    const email = mocks.user.email.toLowerCase();
    const newUser = {
        email,
        password: await bcrypt.hash(mocks.user.password, 10),
        permissions: { set: ['USER'] },
    };
    const { id } = await db.mutation.createUser({ data: newUser }, '{ id }');
    globalData.userId = id;
};

const clearDB = async () => {
    await deleteData(db, { email: mocks.user.email });
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
    test('should return error if user isn\'t authenticated', async () => {
        const { errors } = await makePromise(execute(globalData.link, {
            query: UPDATE_MY_INFO_MUTATION,
            variables: { data: {} },
        }));
        expect(errors[0].message).toEqual('Authentication is required');
    });

    test('should update user\'s info', async () => {
        const { linkWithAuthCookies, userId: id } = globalData;
        const data = { timeZone: 'Europe/Moscow', locale: 'ru' };
        const before = await db.query.user({ where: { id } });
        const { data: { updateMyInfo }, errors } = await makePromise(execute(linkWithAuthCookies, {
            query: UPDATE_MY_INFO_MUTATION,
            variables: { data },
        }));

        const after = await db.query.user({ where: { id } });

        expect(before.timeZone).toEqual('GMT');
        expect(before.locale).toEqual('en-GB');
        expect(updateMyInfo).toMatchObject(data);
        expect(after).toMatchObject(data);
    });

    test('should return error if timeZone doesn\'t exist', async () => {
        const { linkWithAuthCookies } = globalData;
        const data = { timeZone: 'sldkafjlkjdsaf' };
        const { errors } = await makePromise(execute(linkWithAuthCookies, {
            query: UPDATE_MY_INFO_MUTATION, variables: { data },
        }));
        expect(errors[0].message).toEqual('Not valid argument: timeZone');
    });
});
