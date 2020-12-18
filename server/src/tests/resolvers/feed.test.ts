import faker from 'faker';
import { getRepository } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { createSanitizedItem } from '../../feed-parser/filter-item';
import { insertNewItems } from '../../feed-watcher/watcher-utils';
import { getSdk } from '../graphql/generated';
import '../test-utils/connection';
import { generateItem, generateMeta } from '../test-utils/generate-feed';
import { generateUserAndGetSdk } from '../test-utils/login';

const generateItems = (num: number) =>
    new Array(num).fill('').map((_, idx) => generateItem(new Date(Date.now() - idx * 360000)));

describe('Feed resolver. Paginated items', () => {
    let feed: Feed;
    const itemsGuids: string[] = [];
    let sdk: ReturnType<typeof getSdk>;
    let user: User;

    beforeAll(async () => {
        ({ sdk, user } = await generateUserAndGetSdk());
        feed = await getRepository(Feed)
            .merge(new Feed(), generateMeta(), { url: faker.internet.url() })
            .save();
        const userFeed = new UserFeed();
        userFeed.userId = user.id;
        userFeed.feedId = feed.id;
        await userFeed.save();
        const items = generateItems(10).map((item) => createSanitizedItem(item, feed.id));
        await insertNewItems(items);
        itemsGuids.push(...items.map((i) => i.guid));
    });

    afterAll(async () => {
        await feed.remove();
        await user.remove();
    });

    test('should fetch items', async () => {
        const take = 2;
        const { myFeedItems } = await sdk.myFeedItems({ feedId: feed.id, take, skip: 0 });
        const receivedItems = myFeedItems.items.map((i) => i.guid);
        expect(receivedItems).toHaveLength(take);
        expect(myFeedItems.count).toBe(itemsGuids.length);
        expect(receivedItems).toEqual(itemsGuids.slice(0, take));

        const nextTake = 3;
        const { myFeedItems: nextItems } = await sdk.myFeedItems({
            feedId: feed.id,
            take: nextTake,
            skip: take,
        });
        expect(nextItems.items.map((i) => i.guid)).toEqual(itemsGuids.slice(take, take + nextTake));
    });
});
