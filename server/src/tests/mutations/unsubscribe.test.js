const faker = require('faker/locale/en');
const { execute, makePromise } = require('apollo-link');
const { sendUnsubscribe } = require('../../mail-sender/dispatcher');
const { deleteData, runServer, getApolloLink, createMockDate } = require('./_common');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');

const globalData = {};
const RealDate = Date;
const mockDate = createMockDate();
faker.seed(55);

const mocks = {
    user: {
        email: faker.internet.email(),
    },
    feed: {
        url: faker.internet.url(),
        title: faker.random.words(),
    },
    token: faker.random.uuid(),
};

jest.mock('nanoid', () => jest.fn(async () => mocks.token));
jest.mock('../../mail-sender/dispatcher.js', () => ({
    sendUnsubscribe: jest.fn(async () => {}),
}));

const populateDb = async () => {
    const { user: { email }, feed: { title, url } } = mocks;
    const feed = { create: { url, title } };
    return db.mutation.createUser({
        data: { email, feeds: { create: { feed } } },
    });
};

const clearDB = async () => {
    await deleteData(db, { email: mocks.user.email, url: mocks.feed.url });
};

beforeAll(async () => {
    globalData.yogaApp = await runServer(db);
    const { port } = globalData.yogaApp.address();
    globalData.link = getApolloLink(port);
    await clearDB();
    await populateDb();
});

afterEach(() => {
    jest.clearAllMocks();
    global.Date = RealDate;
});

afterAll(async () => {
    globalData.yogaApp.close();
    await clearDB();
});


describe('requestUnsubscribe mutation', () => {
    test('should send mail with token', async () => {
        const { user: { email }, feed: { title }, token } = mocks;
        const user = await db.query.user({ where: { email } }, '{ feeds { id } }');
        const { id } = user.feeds[0];
        const { data } = await makePromise(execute(globalData.link, {
            query: gq.REQUEST_UNSUBSCRIBE_MUTATION,
            variables: { id },
        }));
        expect(data).toMatchObject({ requestUnsubscribe: { message: 'OK' } });
        expect(sendUnsubscribe).toBeCalledWith(email, token, title);
    });

    test('should return error and don\'t send mail', async () => {
        const { data, errors } = await makePromise(execute(globalData.link, {
            query: gq.REQUEST_UNSUBSCRIBE_MUTATION,
            variables: { id: faker.random.uuid() },
        }));
        expect(data).toBeNull();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ message: 'Feed doesn\'t exist' });
        expect(sendUnsubscribe).not.toBeCalled();
    });
});

describe('unsubscribe mutation', () => {
    test('should return error with incorrect token', async () => {
        const { errors } = await makePromise(execute(globalData.link, {
            query: gq.UNSUBSCRIBE_MUTATION,
            variables: { token: faker.random.uuid() },
        }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ message: 'The token is invalid or expired' });
    });

    test('should return error if token is expired', async () => {
        mockDate(Date.now() + 3600000 * 25);
        const { token } = mocks;
        const { errors } = await makePromise(execute(globalData.link, {
            query: gq.UNSUBSCRIBE_MUTATION,
            variables: { token },
        }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ message: 'The token is invalid or expired' });
    });

    test('should delete feed with correct token', async () => {
        const { user: { email }, token } = mocks;
        const user = await db.query.user({ where: { email } }, '{ feeds { id } }');
        const { id } = user.feeds[0];
        const { data } = await makePromise(execute(globalData.link, {
            query: gq.UNSUBSCRIBE_MUTATION,
            variables: { token },
        }));
        expect(data).toMatchObject({ unsubscribe: { id } });
        const userFeedExists = await db.exists.UserFeed({ unsubscribeToken: token });
        expect(userFeedExists).toBeFalsy();
    });
});
