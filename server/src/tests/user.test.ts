import { Connection } from 'typeorm';
import faker from 'faker';
import argon2 from 'argon2';
import { initDbConnection } from '../dbConnection';
import { getSdk } from './generated/graphql';
import getTestClient from './utils/getClient';
import { User } from '../entities/User';

let sdk: ReturnType<typeof getSdk>;
let dbConnection: Connection;

beforeAll(async () => {
    sdk = getSdk(getTestClient());
    dbConnection = await initDbConnection();
});

afterAll(async () => {
    await dbConnection.close();
});

const deleteUserWithEmail = (email: string) =>
    dbConnection
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('email = :email', { email })
        .execute();

describe('User creation', () => {
    let email: string;
    let password: string;

    beforeAll(async () => {
        email = faker.internet.email();
        password = faker.internet.password(8);
        await deleteUserWithEmail(email);
    });

    afterAll(async () => {
        await deleteUserWithEmail(email);
    });

    test('should create user and return', async () => {
        const { register } = await sdk.register({ email, password });
        expect(register.user?.email).toBe(email);
    });

    test('should hash password', async () => {
        const user = await User.findOne({ where: { email } });
        expect(user).not.toBeUndefined();
        expect(await argon2.verify(user!.password, password)).toBeTruthy();
    });

    test('should return error message if user already exist', async () => {
        const { register } = await sdk.register({ email, password });
        expect(register.errors![0]).toMatchObject({
            message: 'User already exists',
            field: 'email',
        });
    });
});
