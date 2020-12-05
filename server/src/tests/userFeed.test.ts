import { Connection } from 'typeorm';
import faker from 'faker';
import argon2 from 'argon2';
import { initDbConnection } from '../dbConnection';
import { getSdk } from './graphql/generated';
import getTestClient from './test-utils/getClient';
import { User } from '../entities/User';
import { deleteUserWithEmail, deleteFeedWithUrl } from './test-utils/dbQueries';
import { getSdkWithLoggedInUser } from './test-utils/login';
import { UserFeed } from '../entities/UserFeed';

let dbConnection: Connection;

beforeAll(async () => {
    dbConnection = await initDbConnection();
});

afterAll(() => dbConnection.close());

describe('Add user feed without logging', () => {
    let feedUrl: string;
    let feedUrl2: string;
    let email: string;
    let sdk: ReturnType<typeof getSdk>;

    beforeAll(async () => {
        email = faker.internet.email().toLowerCase();
        feedUrl = faker.internet.url();
        feedUrl2 = faker.internet.url();
        sdk = getSdk(getTestClient().client);
        await deleteUserWithEmail(email);
    });

    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email), //
            deleteFeedWithUrl(feedUrl),
            deleteFeedWithUrl(feedUrl2),
        ]),
    );

    test('should create feed and user if email is passed', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(errors).toBeNull();
        expect(userFeed).not.toBeNull();
        expect(userFeed?.feed.url).toBe(feedUrl);
        expect(userFeed?.activated).toBe(false);
    });

    test('should return error if user already have this feed', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(userFeed).toBeNull();
        expect(Array.isArray(errors)).toBeTruthy();
        expect(errors![0]).toMatchObject({
            argument: 'url',
            message: 'feed was already added',
        });
    });

    test('should add another feed to the same user', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl: feedUrl2 });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(errors).toBeNull();
        expect(userFeed?.feed.url).toBe(feedUrl2);
        const user = await User.findOne({ where: { email } });
        const uFeed = await UserFeed.find({ where: { userId: user?.id } });
        expect(uFeed).toHaveLength(2);
    });
});

describe('Add user feed after logged in', () => {
    let password: string;
    let email: string;
    let feedUrl: string;
    let feedUrl2: string;
    let sdk: ReturnType<typeof getSdk>;

    beforeAll(async () => {
        email = faker.internet.email().toLowerCase();
        password = faker.internet.password(8);
        feedUrl = faker.internet.url();
        feedUrl2 = faker.internet.url();
        await deleteUserWithEmail(email);
        await User.create({ email, password: await argon2.hash(password) }).save();
    });

    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email), //
            deleteFeedWithUrl(feedUrl),
            deleteFeedWithUrl(feedUrl2),
        ]),
    );

    test('should add feed to current user', async () => {
        sdk = await getSdkWithLoggedInUser(email, password);
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ feedUrl });
        const { errors, userFeed } = addFeedToCurrentUser!;
        expect(errors).toBeNull();
        expect(userFeed).not.toBeNull();
        expect(userFeed?.feed.url).toBe(feedUrl);
        expect(userFeed?.activated).toBe(false);
    });

    test('should return error if user already have this feed', async () => {
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ feedUrl });
        const { userFeed, errors } = addFeedToCurrentUser!;
        expect(userFeed).toBeNull();
        expect(Array.isArray(errors)).toBeTruthy();
        expect(errors![0]).toMatchObject({ argument: 'url', message: 'feed was already added' });
    });

    test('should add another feed to the same user', async () => {
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ feedUrl: feedUrl2 });
        const { userFeed, errors } = addFeedToCurrentUser!;
        expect(errors).toBeNull();
        expect(userFeed?.feed.url).toBe(feedUrl2);
        const user = await User.findOne({ where: { email } });
        const uFeed = await UserFeed.find({ where: { userId: user?.id } });
        expect(uFeed).toHaveLength(2);
    });

    test('get user feeds', async () => {
        const { me } = await sdk.meWithFeeds();
        expect(me?.feeds).toHaveLength(2);
        expect(me?.feeds[0].activated).toBe(false);
        expect(me?.feeds[0].feed).toHaveProperty('url', feedUrl);
        expect(me?.feeds[1].feed).toHaveProperty('url', feedUrl2);
    });
});
