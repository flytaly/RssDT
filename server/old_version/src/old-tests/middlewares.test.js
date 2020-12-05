/* eslint-env jest */
const jwt = require('jsonwebtoken');
const createAuthMiddleware = require('../middlewares/jwtAuth');
const mocks = require('./mocks/middlewares.mocks');

const user = {
    id: mocks.id,
    email: mocks.user.email,
};

const db = {
    query: {
        user: jest.fn(() => (user)),
    },
};
let authMiddleware;
const baseReq = {
    cookies: {
        token: jwt.sign({ userId: mocks.id }, process.env.APP_SECRET),
    },
};
beforeAll(() => {
    authMiddleware = createAuthMiddleware(db);
});

describe('authMiddleware', () => {
    test('should populate user', async () => {
        const req = { ...baseReq };
        const next = jest.fn();
        await authMiddleware(req, {}, next);

        expect(next).toBeCalledTimes(1);
        expect(db.query.user).toBeCalledWith({ where: { id: mocks.id } }, '{ id, permissions, email }');
        expect(req.user).toMatchObject(user);
    });
    test('should not populate user without token', async () => {
        const req = { cookies: {} };
        const next = jest.fn();
        await authMiddleware(req, {}, next);

        expect(next).toBeCalledTimes(1);
        expect(req.user).toBeUndefined();
    });

    test('should not populate user with invalid token', async () => {
        const req = { cookies: { token: 'token' } };
        const next = jest.fn();
        await authMiddleware(req, {}, next);

        expect(next).toBeCalledTimes(1);
        expect(req.user).toBeUndefined();
    });

    test('should not populate user with invalid token', async () => {
        const req = { cookies: { token: jwt.sign({ userId: mocks.id }, 'fakeSecret') } };
        const next = jest.fn();
        await authMiddleware(req, {}, next);

        expect(next).toBeCalledTimes(1);
        expect(req.user).toBeUndefined();
    });
});
