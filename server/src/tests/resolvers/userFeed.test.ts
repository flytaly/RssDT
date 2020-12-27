import faker from 'faker';
import nock from 'nock';
import { Connection } from 'typeorm';
import { initDbConnection } from '../../dbConnection';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { UserFeedOptionsInput } from '../../resolvers/common/inputs';
import { DigestSchedule, TernaryState, Theme } from '../../types/enums';
import { getSdk } from '../graphql/generated';
import { deleteFeedWithUrl, deleteUserWithEmail } from '../test-utils/dbQueries';
import { generateFeed } from '../test-utils/generate-feed';
import getTestClient from '../test-utils/getClient';
import { generateUserAndGetSdk } from '../test-utils/login';

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
    afterAll(() => Promise.all([deleteUserWithEmail(email), deleteFeedWithUrl(feed.feedUrl)]));
    test('should normalize url', async () => {
        const { addFeedWithEmail } = await sdk.addFeedWithEmail({
            input: { email, feedUrl: inputUrl },
        });
        expect(addFeedWithEmail?.userFeed?.feed.url).toBe(correctUrl);
    });
    test('should validate url', async () => {
        const wrongUrls = ['', 'https:', 'https://', 'ftp://asdf.com', 'juststring'];
        await Promise.all(
            wrongUrls.map(async (url) => {
                const { addFeedWithEmail } = await sdk.addFeedWithEmail({
                    input: { email, feedUrl: url },
                });
                expect(addFeedWithEmail?.errors?.[0].argument).toBe('feedUrl');
            }),
        );
    });
});

describe('My Feeds', () => {
    const feeds = [generateFeed(), generateFeed(), generateFeed()];
    let sdk: ReturnType<typeof getSdk>;
    let user: User;
    const idsList: number[] = [];

    beforeAll(async () => {
        feeds.forEach((f) => f.mockRequests());
        ({ user, sdk } = await generateUserAndGetSdk('testmyfeeds@test.com'));
    });

    afterAll(async () => {
        await user.remove();
        return Promise.all(feeds.map((f) => deleteFeedWithUrl(f.feedUrl)));
    });

    describe('Get my feeds', () => {
        test('should response with feeds', async () => {
            const responses = feeds.map(({ feedUrl }) =>
                sdk.addFeedToCurrentUser({ input: { feedUrl } }),
            );
            await Promise.all(responses);
            const { myFeeds } = await sdk.myFeeds();
            expect(myFeeds).toHaveLength(feeds.length);
        });
    });
    describe('Remove my feeds', () => {
        test('should remove feeds', async () => {
            const idsToDelete = idsList.slice(0, 2);
            const { deleteMyFeeds } = await sdk.deleteMyFeeds({ ids: idsToDelete });
            expect(deleteMyFeeds.ids).toEqual(
                expect.arrayContaining(idsToDelete.map((id) => String(id))),
            );
        });
    });
});

describe('UserFeed options', () => {
    const feed = generateFeed();
    let sdk: ReturnType<typeof getSdk>;
    let user: User;
    let userFeedId: number | undefined;

    beforeAll(async () => {
        feed.mockRequests();
        ({ user, sdk } = await generateUserAndGetSdk('testmyfeeds2@test.com'));
        const response = await sdk.addFeedToCurrentUser({ input: { feedUrl: feed.feedUrl } });

        userFeedId = response.addFeedToCurrentUser.userFeed?.id;
    });

    afterAll(async () => {
        await user.remove();
        deleteFeedWithUrl(feed.feedUrl);
    });

    test('should contain user feed options', async () => {
        const { myFeeds } = await sdk.myFeeds();
        expect(myFeeds?.[0]).toMatchObject({
            activated: false,
            schedule: DigestSchedule.daily,
            withContentTable: TernaryState.default,
            itemBody: TernaryState.default,
            attachments: TernaryState.default,
            theme: Theme.default,
        });
    });
    test('should update user feed options', async () => {
        const opts: UserFeedOptionsInput = {
            schedule: DigestSchedule.every6hours,
            withContentTable: TernaryState.disable,
            itemBody: TernaryState.enable,
            attachments: TernaryState.enable,
            theme: Theme.text,
        };
        const { setFeedOptions } = await sdk.setFeedOptions({ id: userFeedId!, opts });
        expect(setFeedOptions.userFeed).toMatchObject(opts);
    });

    test("should forbid updating of someone else's feed", async () => {
        const anotherUser = await generateUserAndGetSdk('someoneelse@test.com');
        const opts = { attachments: TernaryState.disable };
        const ufBefore = await UserFeed.findOne(userFeedId);
        ufBefore!.attachments = TernaryState.enable;
        await ufBefore!.save();
        const { setFeedOptions } = await anotherUser.sdk.setFeedOptions({ id: userFeedId!, opts });
        expect(setFeedOptions.userFeed).toBeNull();
        const ufAfter = await UserFeed.findOne(userFeedId);
        expect(ufAfter?.attachments).toBe(TernaryState.enable);
        await anotherUser.user.remove();
    });
});
