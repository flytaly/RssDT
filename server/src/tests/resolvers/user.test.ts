import { Connection, getCustomRepository } from 'typeorm';
import faker from 'faker';
import argon2 from 'argon2';
import Redis from 'ioredis-mock';
import { addMockFunctionsToSchema } from 'apollo-server-express';
import { initDbConnection } from '../../dbConnection';
import { getSdk, LoginMutation, RegisterMutation } from '../graphql/generated';
import getTestClient from '../test-utils/getClient';
import { User } from '../../entities/User';
import { deleteUserWithEmail } from '../test-utils/dbQueries';
import { deleteEmails, getEmailByAddress } from '../test-utils/test-emails';
import { getSdkWithLoggedInUser } from '../test-utils/login';

let dbConnection: Connection;

beforeAll(async () => {
    dbConnection = await initDbConnection();
});

afterAll(() => dbConnection.close());

describe('User creation', () => {
    let email: string;
    let password: string;

    beforeAll(async () => {
        email = faker.internet.email().toLowerCase();
        password = faker.internet.password(8);
        await deleteUserWithEmail(email);
    });

    afterAll(() => deleteUserWithEmail(email));

    test('should create user and return cookie', async () => {
        const { client, lastHeaders } = getTestClient();
        const sdk = getSdk(client);
        const { register } = await sdk.register({ email, password });
        expect(register.user?.email).toBe(email);

        const cookie = lastHeaders.pop()?.get('set-cookie');
        client.setHeader('cookie', cookie!);
        const { me } = await sdk.me();
        expect(me?.email).toBe(email);
        expect(me?.emailVerified).toBe(false);
    });

    describe('Activation', () => {
        const sdkAnonym = getSdk(getTestClient().client);
        afterEach(() => deleteEmails());

        async function expectToActivate() {
            const mail = await getEmailByAddress(email);
            expect(mail).not.toBeUndefined();
            expect(mail).toHaveProperty('subject', 'Confirm registration');
            const found = mail?.text.match(/confirm-register\?token=(?<token>.+)&id=(?<id>\d+)/);
            expect(found).not.toBeUndefined();
            expect(found?.groups).not.toBeUndefined();
            const { verifyEmail } = await sdkAnonym.verifyEmail({
                token: found!.groups!.token,
                userId: found!.groups!.id,
            });
            expect(verifyEmail.user).toMatchObject({ email, emailVerified: true });
        }
        test('should send confirmation email and activate with token', async () => {
            await expectToActivate();
        });

        test('requestEmailVerification: should send confirmation email', async () => {
            expect(sdkAnonym.requestEmailVerification()).rejects.toThrowError();
            const sdk = await getSdkWithLoggedInUser(email, password);
            const response = await sdk.requestEmailVerification();
            expect(response.requestEmailVerification).toBe(true);
            await expectToActivate();
        });
    });

    test('should not be logged in without cookie', async () => {
        const sdk = getSdk(getTestClient().client);
        let error;
        try {
            await sdk.me();
        } catch (e) {
            error = e;
        }
        expect(error.message.startsWith('not authenticated')).toBeTruthy();
    });

    test('should hash password', async () => {
        const user = await User.findOne({ where: { email } });
        expect(user).not.toBeUndefined();
        expect(await argon2.verify(user!.password!, password)).toBeTruthy();
    });

    test('should return error message if user already exist', async () => {
        const sdk = getSdk(getTestClient().client);
        const { register } = await sdk.register({ email, password });
        expect(register.errors![0]).toMatchObject({
            message: 'User already exists',
            argument: 'email',
        });
    });
});

describe('Logging-in', () => {
    let email: string;
    let password: string;

    beforeAll(async () => {
        email = faker.internet.email().toLowerCase();
        password = faker.internet.password(8);
        await deleteUserWithEmail(email);
    });

    afterAll(() => deleteUserWithEmail(email));

    test('should register', async () => {
        const sdk = getSdk(getTestClient().client);
        const { register } = await sdk.register({ email, password });
        expect(register.user?.email).toBe(email);
    });

    test('should log in and set cookie with correct password', async () => {
        const { client, lastHeaders } = getTestClient();
        const sdk = getSdk(client);
        const { login } = await sdk.login({ email, password });
        expect(login.user?.email).toBe(email);

        const cookie = lastHeaders.pop()?.get('set-cookie');
        client.setHeader('cookie', cookie!);
        const { me } = await sdk.me();
        expect(me?.email).toBe(email);
    });

    test('should return error with incorrect email', async () => {
        const sdk = getSdk(getTestClient().client);
        const { login } = await sdk.login({ email: 'wrongemail@something.com', password });
        expect(login.user).toBeNull();
        expect(login.errors![0]).toMatchObject({
            message: "User with such email doesn't exist",
            argument: 'email',
        });
    });

    test('should return error with incorrect password', async () => {
        const sdk = getSdk(getTestClient().client);
        const { login: login1 } = await sdk.login({ email, password: 'password1234' });
        expect(login1.user).toBeNull();
        expect(login1.errors![0]).toMatchObject({
            message: 'Wrong password',
            argument: 'password',
        });

        const { login: login2 } = await sdk.login({ email, password: '' });
        expect(login2.user).toBeNull();
        expect(login2.errors![0]).toMatchObject({
            message: '"password" is not allowed to be empty',
            argument: 'password',
        });
    });
});

describe('Normalization', () => {
    let email: string;
    let password: string;

    beforeAll(async () => {
        email = ` ${faker.internet.email().toUpperCase()} `;
        password = ' password  ';
        await deleteUserWithEmail(email);
    });

    afterAll(() => deleteUserWithEmail(email));
    test('should normalize inputs', async () => {
        const sdk = getSdk(getTestClient().client);
        const normEmail = email.trim().toLowerCase();
        const normPassword = password.trim().toLowerCase();
        const { register } = await sdk.register({
            email: normEmail,
            password: normPassword,
        });
        expect(register.user?.email).toBe(normEmail);

        const { login } = await sdk.login({
            email: normEmail,
            password: normPassword,
        });
        expect(login?.user?.email).toBe(normEmail);
    });
});

describe('Validation', () => {
    const email = 'This is definitely not an email';
    const password = 'short';

    test('should response with errors on register', async () => {
        const sdk = getSdk(getTestClient().client);
        const wrongArgument = (resp: RegisterMutation, argument: string) => {
            expect(resp.register?.errors?.[0].argument).toBe(argument);
        };

        wrongArgument(await sdk.register({ email: '', password: '32742374892374' }), 'email');
        wrongArgument(
            await sdk.register({ email: faker.internet.email(), password: '' }),
            'password',
        );
        wrongArgument(await sdk.register({ email, password: '32742374892374' }), 'email');
        wrongArgument(await sdk.register({ email: faker.internet.email(), password }), 'password');
    });
    test('should response with errors on login', async () => {
        const wrongArgument = (resp: LoginMutation, argument: string) => {
            expect(resp.login?.errors?.[0].argument).toBe(argument);
        };
        const sdk = getSdk(getTestClient().client);
        wrongArgument(await sdk.login({ email: '', password: '32742374892374' }), 'email');
        wrongArgument(await sdk.login({ email: faker.internet.email(), password: '' }), 'password');
        wrongArgument(await sdk.login({ email, password: '32742374892374' }), 'email');
        wrongArgument(await sdk.login({ email: faker.internet.email(), password }), 'password');
    });
});
