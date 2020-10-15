import { Connection } from 'typeorm';
import faker from 'faker';
import argon2 from 'argon2';
import { initDbConnection } from '../dbConnection';
import { getSdk } from './generated/graphql';
import getTestClient from './utils/getClient';
import { User } from '../entities/User';
import { deleteUserWithEmail, deleteFeedWithUrl } from './utils/dbQueries';
import { getSdkWithLoggedInUser } from './utils/login';
import { UserFeed } from '../entities/UserFeed';

let dbConnection: Connection;

beforeAll(async () => {
    dbConnection = await initDbConnection();
});

afterAll(() => dbConnection.close());

describe('Add user feed without logining', () => {
    let url: string;
    let url2: string;
    let email: string;
    let sdk: ReturnType<typeof getSdk>;

    beforeAll(async () => {
        email = faker.internet.email().toLowerCase();
        url = faker.internet.url();
        url2 = faker.internet.url();
        sdk = getSdk(getTestClient().client);
        await deleteUserWithEmail(email);
    });

    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email), //
            deleteFeedWithUrl(url),
            deleteFeedWithUrl(url2),
        ]),
    );

    test('should create feed and user if email is passed', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, url });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(errors).toBeNull();
        expect(userFeed).not.toBeNull();
        expect(userFeed?.feed.url).toBe(url);
        expect(userFeed?.activated).toBe(false);
    });

    test('should return error if user already have this feed', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, url });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(userFeed).toBeNull();
        expect(Array.isArray(errors)).toBeTruthy();
        expect(errors![0]).toMatchObject({
            field: 'url',
            message: 'feed was already added',
        });
    });

    test('should add another feed to the same user', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, url: url2 });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(errors).toBeNull();
        expect(userFeed?.feed.url).toBe(url2);
        const user = await User.findOne({ where: { email } });
        const uFeed = await UserFeed.find({ where: { userId: user?.id } });
        expect(uFeed).toHaveLength(2);
    });
});

describe('Add user feed after logged in', () => {
    let password: string;
    let email: string;
    let url: string;
    let url2: string;
    let sdk: ReturnType<typeof getSdk>;

    beforeAll(async () => {
        email = faker.internet.email().toLowerCase();
        password = faker.internet.password(8);
        url = faker.internet.url();
        url2 = faker.internet.url();
        await deleteUserWithEmail(email);
        await User.create({ email, password: await argon2.hash(password) }).save();
    });

    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email), //
            deleteFeedWithUrl(url),
            deleteFeedWithUrl(url2),
        ]),
    );

    test('should add feed to current user', async () => {
        sdk = await getSdkWithLoggedInUser(email, password);
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ url });
        const { errors, userFeed } = addFeedToCurrentUser!;
        expect(errors).toBeNull();
        expect(userFeed).not.toBeNull();
        expect(userFeed?.feed.url).toBe(url);
        expect(userFeed?.activated).toBe(false);
    });

    test('should return error if user already have this feed', async () => {
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ url });
        const { userFeed, errors } = addFeedToCurrentUser!;
        expect(userFeed).toBeNull();
        expect(Array.isArray(errors)).toBeTruthy();
        expect(errors![0]).toMatchObject({ field: 'url', message: 'feed was already added' });
    });

    test('should add another feed to the same user', async () => {
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ url: url2 });
        const { userFeed, errors } = addFeedToCurrentUser!;
        expect(errors).toBeNull();
        expect(userFeed?.feed.url).toBe(url2);
        const user = await User.findOne({ where: { email } });
        const uFeed = await UserFeed.find({ where: { userId: user?.id } });
        expect(uFeed).toHaveLength(2);
    });
});
