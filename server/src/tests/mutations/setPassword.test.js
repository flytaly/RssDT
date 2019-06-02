/* eslint-env jest */

const { execute, makePromise } = require('apollo-link');
const bcrypt = require('bcrypt');
const { deleteData, runServer, getApolloLink, createMockDate } = require('./_common');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');

let yogaApp;
let link;
const RealDate = Date;
const mockDate = createMockDate();
const watcher = {};

const moduleName = 'setpassword';
const mocks = {
    user: {
        email: `${moduleName}-testuser@test.com`,
        password: `${moduleName}_password`,
        setPasswordToken: 'setPasswordToken',
        setPasswordTokenExpiry: new Date(Date.now() + 1000 * 3600 * 12),
    },
};

jest.mock('nanoid', () => jest.fn(async () => mocks.activationToken));

const clearDB = async () => {
    await deleteData(db, { email: mocks.user.email });
};

beforeAll(async () => {
    yogaApp = await runServer(db, watcher);
    const { port } = yogaApp.address();
    link = getApolloLink(port);
    await clearDB();

    await db.mutation.createUser({ data: { ...mocks.user, password: '' } });
});
afterEach(() => {
    global.Date = RealDate;
});

afterAll(async () => {
    yogaApp.close();
    await clearDB();
});

describe('setPassword', () => {
    test('should return error if token is wrong', async () => {
        const { errors } = await makePromise(execute(link, {
            query: gq.SET_PASSWORD_MUTATION,
            variables: { password: mocks.user.password, token: 'fakeToken' },
        }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ message: 'The token is invalid or expired' });
    });

    test('should return error if token is expired', async () => {
        mockDate(Date.now() + 3600000 * 13);
        const { email, password } = mocks.user;
        const { setPasswordToken: token } = await db.query.user({ where: { email } });
        const { errors } = await makePromise(execute(link, {
            query: gq.SET_PASSWORD_MUTATION,
            variables: { password, token },
        }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ message: 'The token is invalid or expired' });
    });

    test('should save password\'s hash', async () => {
        const { email, password } = mocks.user;
        const { setPasswordToken: token } = await db.query.user({ where: { email } });

        const { data } = await makePromise(execute(link, {
            query: gq.SET_PASSWORD_MUTATION,
            variables: { password, token },
        }));
        expect(data.setPassword.email).toEqual(email.toLowerCase());

        const user = await db.query.user({ where: { email } });
        const validPassword = await bcrypt.compare(password, user.password);

        expect(validPassword).toBeTruthy();
        expect(user.setPasswordToken).toBeNull();
        expect(user.setPasswordTokenExpiry).toBeNull();
    });
});
