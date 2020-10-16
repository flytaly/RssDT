import { Connection, getConnection } from 'typeorm';
import argon2 from 'argon2';
import { initDbConnection } from '../dbConnection';
import { getSdk } from './generated/graphql';
import getTestClient from './utils/getClient';
import { deleteFeedWithUrl, deleteUserWithEmail } from './utils/dbQueries';
import { User } from '../entities/User';
import { Feed } from '../entities/Feed';

let dbConnection: Connection;

beforeAll(async () => {
    dbConnection = await initDbConnection();
});

afterAll(() => dbConnection.close());

describe('Normalize input middleware', () => {
    const email = ' EmailWithCamelCase@Gmail.Com   ';
    const correctEmail = email.trim().toLowerCase();
    const password = ' password ';
    const sdk = getSdk(getTestClient().client);

    beforeAll(() => deleteUserWithEmail(correctEmail));
    afterAll(() => deleteUserWithEmail(correctEmail));

    test('should convert to lower case and trim before saving to db', async () => {
        const { register } = await sdk.register({ email, password });
        expect(register.user?.email).toBe(correctEmail);

        const user = await User.findOne({ email: correctEmail });
        expect(user?.email).toBe(correctEmail);
        expect(await argon2.verify(user!.password!, password.trim())).toBeTruthy();
    });

    test('should normalizeURL', async () => {
        const feedUrl = 'someURL.COM/feed/';
        const normUrl = 'http://someurl.com/feed';
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({ email, feedUrl });
        const { id } = addFeedWithEmail!.userFeed!.feed;
        const feed = await Feed.findOne({ id });
        expect(feed?.url).toBe(normUrl);
        await deleteFeedWithUrl(feedUrl);
    });
});
