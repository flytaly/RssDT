/* eslint-disable import/first */

import moment from 'moment';
import { Connection, getRepository } from 'typeorm';
import faker from 'faker';
import { getNewItems } from '../feed-parser/parse-utils';
import { initDbConnection } from '../dbConnection';
import { deleteFeedWithUrl } from '../tests/test-utils/dbQueries';
import { generateItem, generateMeta } from '../tests/test-utils/generate-feed';
import Watcher from './watcher';
import { Feed } from '../entities/Feed';
import { Item } from '../entities/Item';

jest.mock('../feed-parser/parse-utils.ts', () => ({
    getNewItems: jest.fn(async () => {}),
}));

let db: Connection;

beforeAll(async () => {
    db = await initDbConnection();
});

afterAll(() => {
    return db.close();
});

describe('Feed watcher schedule', () => {
    test("should create watcher's instance that has managing methods", () => {
        const feedWatcher = new Watcher();
        feedWatcher.start();
        expect(moment.isMoment(feedWatcher.getNextUpdateTime())).toBeTruthy();

        feedWatcher.cancel();
        expect(feedWatcher.getNextUpdateTime()).toBeNull();
    });

    // test('should call update every fixed amount of time', async () => {
    //     const feedWatcher = new Watcher({ cron: '*/1 * * * * *' }); // update every second
    //     feedWatcher.update = jest.fn(async () => {});
    //     feedWatcher.start();
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     feedWatcher.cancel();
    //     expect(feedWatcher.update).toHaveBeenCalledTimes(2);
    // });
});

describe('Watcher Update', () => {
    const feedWatcher = new Watcher();
    const feedUrl = faker.internet.url();
    const oldItems = [
        generateItem(new Date(Date.now() - 2 * 360000)),
        generateItem(new Date(Date.now() - 3 * 360000)),
        generateItem(new Date(Date.now() - 360000)),
    ];
    const feedMeta = generateMeta();

    beforeAll(async () => {
        const feed = await getRepository(Feed).merge(new Feed(), feedMeta, { url: feedUrl }).save();
        await Promise.all(
            oldItems.map((i) => {
                const item = new Item();
                Object.assign(item, i, { feedId: feed.id });
                return item.save();
            }),
        );
    });
    afterAll(() => Promise.all([deleteFeedWithUrl(feedUrl)]));

    test('should update', async () => {
        const newItems = [
            generateItem(new Date(Date.now() - 1000)),
            generateItem(new Date(Date.now())),
        ];
        const newMeta = {
            title: 'new Title',
            description: 'new description',
        };

        (getNewItems as jest.Mock).mockImplementation(
            async (url: string, items: Array<{ pubdate: Date; guid: string }>) => {
                expect(url).toBe(feedUrl);
                expect(items).toHaveLength(oldItems.length);
                const sorted = oldItems.sort(
                    (a, b) => b.pubdate?.getTime()! - a.pubdate?.getTime()!,
                );
                items.forEach((i, idx) => expect(i.guid).toBe(sorted[idx].guid));
                return { feedItems: newItems, feedMeta: newMeta };
            },
        );
        await feedWatcher.update();
        expect(getNewItems).toHaveBeenCalled();
        const feedUpd = await Feed.findOneOrFail({ where: { url: feedUrl }, relations: ['items'] });
        expect(feedUpd).toMatchObject(newMeta);
        expect(feedUpd.items).toHaveLength(oldItems.length + newItems.length);
        newItems.forEach(({ guid }) => {
            expect(feedUpd.items.find((i) => guid === i.guid)).toBeTruthy();
        });
    });
});
