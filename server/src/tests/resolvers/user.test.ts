import argon2 from 'argon2';
import faker from 'faker';
import { Connection } from 'typeorm';
import { initDbConnection } from '../../dbConnection';
import { User } from '../../entities/User';
import { getSdk, LoginMutation, RegisterMutation } from '../graphql/generated';
import { deleteUserWithEmail } from '../test-utils/dbQueries';
import getTestClient from '../test-utils/getClient';
import { getSdkWithLoggedInUser } from '../test-utils/login';
import {
    deleteEmails,
    getConfirmRegisterData,
    getEmailByAddress,
    getPasswordResetData,
} from '../test-utils/test-emails';

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

    test('should not be logged in without cookie', async () => {
        const sdk = getSdk(getTestClient().client);
        expect(sdk.me()).rejects.toThrowError(/not authenticated/);
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

    describe('Email confirmation', () => {
        const sdkAnonym = getSdk(getTestClient().client);
        afterEach(() => deleteEmails());

        async function expectToGetTokenAndActivate() {
            const mail = await getEmailByAddress(email);
            expect(mail).not.toBeUndefined();
            expect(mail).toHaveProperty('subject', 'Confirm registration');
            const { verifyEmail } = await sdkAnonym.verifyEmail(getConfirmRegisterData(mail!));
            expect(verifyEmail.user).toMatchObject({ email, emailVerified: true });
        }
        test('should send confirmation email and activate with token', async () => {
            await expectToGetTokenAndActivate();
        });

        test('requestEmailVerification: should send confirmation email', async () => {
            expect(sdkAnonym.requestEmailVerification()).rejects.toThrowError(/not authenticated/);
            const sdk = await getSdkWithLoggedInUser(email, password);
            const response = await sdk.requestEmailVerification();
            expect(response.requestEmailVerification).toBe(true);
            await expectToGetTokenAndActivate();
        });
    });

    describe('Password reset', () => {
        const sdk = getSdk(getTestClient().client);
        const newPassword = faker.internet.password(10);
        afterEach(() => deleteEmails());
        test('should reset password', async () => {
            const { requestPasswordReset } = await sdk.requestPasswordReset({ email });
            expect(requestPasswordReset).toMatchObject({ message: 'OK' });
            const mail = await getEmailByAddress(email);
            expect(mail).not.toBeUndefined();
            const tokenAndId = getPasswordResetData(mail!);
            const { resetPassword } = await sdk.resetPassword({
                input: { ...tokenAndId, password: newPassword },
            });
            expect(resetPassword.user).toHaveProperty('email', email);
            const userRecord = await User.findOne(tokenAndId.userId);
            expect(await argon2.verify(userRecord!.password!, newPassword)).toBeTruthy();
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
