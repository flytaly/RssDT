import { Connection } from 'typeorm';
import faker from 'faker';
import argon2 from 'argon2';
import { initDbConnection } from '../dbConnection';
import { getSdk } from './generated/graphql';
import getTestClient from './utils/getClient';
import { User } from '../entities/User';
import { deleteUserWithEmail } from './utils/dbQueries';

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
    });

    test('should not be logged in without cookie', async () => {
        const sdk = getSdk(getTestClient().client);
        const { me } = await sdk.me();
        expect(me).toBeNull();
    });

    test('should hash password', async () => {
        const user = await User.findOne({ where: { email } });
        expect(user).not.toBeUndefined();
        expect(await argon2.verify(user!.password, password)).toBeTruthy();
    });

    test('should return error message if user already exist', async () => {
        const sdk = getSdk(getTestClient().client);
        const { register } = await sdk.register({ email, password });
        expect(register.errors![0]).toMatchObject({
            message: 'User already exists',
            field: 'email',
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
            message: "User with such email don't exist",
            field: 'email',
        });
    });

    test('should return error with incorrect password', async () => {
        const sdk = getSdk(getTestClient().client);
        const { login: login1 } = await sdk.login({ email, password: 'password1234' });
        expect(login1.user).toBeNull();
        expect(login1.errors![0]).toMatchObject({
            message: 'Wrong password',
            field: 'password',
        });

        const { login: login2 } = await sdk.login({ email, password: '' });
        expect(login2.user).toBeNull();
        expect(login2.errors![0]).toMatchObject({
            message: 'Wrong password',
            field: 'password',
        });
    });
});
