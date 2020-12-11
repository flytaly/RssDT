import argon2 from 'argon2';
import faker from 'faker';
import nock from 'nock';
import { Connection } from 'typeorm';
import { initDbConnection } from '../../dbConnection';
import { User } from '../../entities/User';
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

describe('Normalize', () => {
    const inputUrl = ' domain.com ';
    const correctUrl = `https://${inputUrl.trim()}`;
    const feed = generateFeed({ feedUrl: correctUrl });
    const email = faker.internet.email().toLowerCase();
    let sdk: ReturnType<typeof getSdk>;
    beforeAll(async () => {
        feed.mockRequests();
        sdk = getSdk(getTestClient().client);
        await deleteUserWithEmail(email);
    });
    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email), //
            deleteFeedWithUrl(feed.feedUrl),
        ]),
    );
    test('should normalize url', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl: inputUrl });
        expect(addFeedWithEmail?.userFeed?.feed.url).toBe(correctUrl);
    });
    test('should validate url', async () => {
        const wrongUrls = ['', 'https:', 'https://', 'ftp://asdf.com', 'juststring'];
        await Promise.all(
            wrongUrls.map(async (url) => {
                const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl: url });
                expect(addFeedWithEmail?.errors?.[0].argument).toBe('feedUrl');
            }),
        );
    });
});

describe('My Feeds', () => {
    const feeds = [generateFeed(), generateFeed()];
    const password = faker.internet.password(8);
    const email = faker.internet.email().toLowerCase();
    let sdk: ReturnType<typeof getSdk>;

    beforeAll(async () => {
        feeds.forEach((f) => f.mockRequests());
        await deleteUserWithEmail(email);
        await User.create({ email, password: await argon2.hash(password) }).save();
        sdk = await getSdkWithLoggedInUser(email, password);
    });

    afterAll(() =>
        Promise.all([
            deleteUserWithEmail(email),
            ...feeds.map((f) => deleteFeedWithUrl(f.feedUrl)),
        ]),
    );
    test('should response with feeds', async () => {
        const responses = feeds.map(({ feedUrl }) => sdk.addFeedToCurrentUser({ feedUrl }));
        await Promise.all(responses);
        const { myFeeds } = await sdk.myFeeds();
        expect(myFeeds).toHaveLength(feeds.length);
        myFeeds!.forEach((f, idx) => {
            expect(f.feed).toMatchObject(feeds[idx].meta);
            expect(f.feed.userFeeds).toBeNull();
        });
    });
});
