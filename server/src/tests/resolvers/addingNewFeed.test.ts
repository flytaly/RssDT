import argon2 from 'argon2';
import faker from 'faker';
import nock from 'nock';
import { Connection } from 'typeorm';
import { initDbConnection } from '../../dbConnection';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { getSdk } from '../graphql/generated';
import { deleteFeedWithUrl, deleteUserWithEmail } from '../test-utils/dbQueries';
import { generateFeed } from '../test-utils/generate-feed';
import getTestClient from '../test-utils/getClient';
import { getSdkWithLoggedInUser } from '../test-utils/login';

let dbConnection: Connection;

beforeAll(async () => {
    dbConnection = await initDbConnection();
});

afterAll(() => {
    nock.cleanAll();
    return dbConnection.close();
});

describe('Add user feed without authentication', () => {
    const feed1 = generateFeed();
    const feed2 = generateFeed();
    const email = faker.internet.email().toLowerCase();
    let sdk: ReturnType<typeof getSdk>;

    beforeAll(async () => {
        feed1.mockRequests();
        feed2.mockRequests();
        sdk = getSdk(getTestClient().client);
        await deleteUserWithEmail(email);
    });

    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email),
            deleteFeedWithUrl(feed1.feedUrl),
            deleteFeedWithUrl(feed2.feedUrl),
        ]),
    );

    test('should create feed and user if email is passed', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl: feed1.feedUrl });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(errors).toBeNull();
        expect(userFeed).not.toBeNull();
        expect(userFeed?.feed.url).toBe(feed1.feedUrl);
        expect(userFeed?.activated).toBe(false);
    });

    test('should return error if user already have this feed', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl: feed1.feedUrl });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(userFeed).toBeNull();
        expect(Array.isArray(errors)).toBeTruthy();
        expect(errors![0]).toMatchObject({
            argument: 'url',
            message: 'feed was already added',
        });
    });

    test('should add another feed to the same user', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl: feed2.feedUrl });
        const { userFeed, errors } = addFeedWithEmail!;
        expect(errors).toBeNull();
        expect(userFeed?.feed.url).toBe(feed2.feedUrl);
        const user = await User.findOne({ where: { email } });
        const uFeed = await UserFeed.find({ where: { userId: user?.id } });
        expect(uFeed).toHaveLength(2);
    });

    describe('Feed activation', () => {});
});

describe('Add user feed after authentication', () => {
    const password = faker.internet.password(8);
    const feed1 = generateFeed();
    const feed2 = generateFeed();
    const email = faker.internet.email().toLowerCase();
    let sdk: ReturnType<typeof getSdk>;

    beforeAll(async () => {
        feed1.mockRequests();
        feed2.mockRequests();
        await deleteUserWithEmail(email);
        await User.create({ email, password: await argon2.hash(password) }).save();
    });

    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email), //
            deleteFeedWithUrl(feed1.feedUrl),
            deleteFeedWithUrl(feed2.feedUrl),
        ]),
    );

    test('should add feed to current user', async () => {
        sdk = await getSdkWithLoggedInUser(email, password);
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ feedUrl: feed1.feedUrl });
        const { errors, userFeed } = addFeedToCurrentUser!;
        expect(errors).toBeNull();
        expect(userFeed).not.toBeNull();
        expect(userFeed?.feed.url).toBe(feed1.feedUrl);
        expect(userFeed?.activated).toBe(false);
    });

    test('should return error if user already have this feed', async () => {
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ feedUrl: feed1.feedUrl });
        const { userFeed, errors } = addFeedToCurrentUser!;
        expect(userFeed).toBeNull();
        expect(Array.isArray(errors)).toBeTruthy();
        expect(errors![0]).toMatchObject({ argument: 'url', message: 'feed was already added' });
    });

    test('should add another feed to the same user', async () => {
        const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ feedUrl: feed2.feedUrl });
        const { userFeed, errors } = addFeedToCurrentUser!;
        expect(errors).toBeNull();
        expect(userFeed?.feed.url).toBe(feed2.feedUrl);
        const user = await User.findOne({ where: { email } });
        const uFeed = await UserFeed.find({ where: { userId: user?.id } });
        expect(uFeed).toHaveLength(2);
    });

    test('get user feeds', async () => {
        const { me } = await sdk.meWithFeeds();
        expect(me?.feeds).toHaveLength(2);
        expect(me?.feeds[0].activated).toBe(false);
        expect(me?.feeds[0].feed).toHaveProperty('url', feed1.feedUrl);
        expect(me?.feeds[1].feed).toHaveProperty('url', feed2.feedUrl);
    });
});

describe('Errors', () => {
    const sdk = getSdk(getTestClient().client);
    const email = faker.internet.email().toLowerCase();

    afterAll(() => {
        nock.cleanAll();
    });
    test('should return argument error: not a feed', async () => {
        const feedUrl = faker.internet.url();
        nock(feedUrl).get('/').reply(200, 'text');
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl });
        const errors = addFeedWithEmail?.errors;
        expect(errors).toHaveLength(1);
        expect(errors![0]).toMatchObject({
            argument: 'url',
            message: 'Not a feed',
        });
    });
    test('should return argument error', async () => {
        const feedUrl = faker.internet.url();
        nock(feedUrl).get('/').replyWithError({ message: 'error_message', code: 'error_code' });
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl });
        const errors = addFeedWithEmail?.errors;
        expect(errors).toHaveLength(1);
        expect(errors![0]).toMatchObject({
            argument: 'url',
            message: "Couldn't get access to feed",
        });
    });
});
