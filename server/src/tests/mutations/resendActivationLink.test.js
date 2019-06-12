const faker = require('faker/locale/en');
const { execute, makePromise } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const { deleteData, runServer, createMockDate } = require('./_common');
const db = require('../../bind-prisma');
const { RESEND_ACTIVATION_LINK } = require('./_gql-queries');
const { sendConfirmSubscription } = require('../../mail-sender/dispatcher');

const globalData = {
    yogaApp: null,
    userFeedId: null,
    userId: null,
    link: null,
};
const mockDate = createMockDate();
const RealDate = Date;

faker.seed(56);
const mocks = {
    user: {
        email: faker.internet.email(),
    },
    feed: {
        url: faker.internet.url(),
        title: faker.random.words(4),
    },
    activationToken: faker.random.alphaNumeric(20),
};

jest.mock('../../mail-sender/dispatcher.js', () => ({
    sendConfirmSubscription: jest.fn(() => Promise.resolve()),
}));
jest.mock('nanoid', () => jest.fn(async () => mocks.activationToken));

const addTestData = async () => {
    const { url, title } = mocks.feed;
    const { email } = mocks.user;
    const createFeed = { create: { url, title } };
    const createUserFeed = { create: { feed: createFeed } };
    const newUser = {
        email,
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
});

afterEach(() => {
    global.Date = RealDate;
});

afterAll(async () => {
    globalData.yogaApp.close();
    await clearDB();
});

describe('', () => {
    test('should return error if ID is wrong', async () => {
        const id = 'fakeId';
        const { errors } = await makePromise(execute(globalData.link, {
            query: RESEND_ACTIVATION_LINK, variables: { id },
        }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ message: 'Feed doesn\'t exist or was already activated' });
    });

    test('should return error if the feed is activated', async () => {
        const { userFeedId: id } = globalData;
        await db.mutation.updateUserFeed({ where: { id }, data: { activated: true } });
        const { errors } = await makePromise(execute(globalData.link, {
            query: RESEND_ACTIVATION_LINK, variables: { id },
        }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ message: 'Feed doesn\'t exist or was already activated' });
    });

    test('should create new activation token and send link to email', async () => {
        const { userFeedId: id } = globalData;
        const { activationToken, user: { email }, feed: { title } } = mocks;
        const dateNow = RealDate.now();
        const expiryDate = new RealDate(dateNow + 1000 * 3600 * 24);
        mockDate(dateNow);

        await db.mutation.updateUserFeed({ where: { id }, data: { activated: false } });
        const { data } = await makePromise(execute(globalData.link, {
            query: RESEND_ACTIVATION_LINK, variables: { id },
        }));
        const after = await db.query.userFeed({ where: { id } });

        expect(data).toMatchObject({ resendActivationLink: { message: 'OK' } });
        expect(sendConfirmSubscription).toHaveBeenCalledWith(email, activationToken, title);
        expect(after.activationToken).toBe(activationToken);
        expect(new RealDate(after.activationTokenExpiry)).toEqual(expiryDate);
    });
});
