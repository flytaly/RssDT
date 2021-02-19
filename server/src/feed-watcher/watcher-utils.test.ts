/* eslint-disable import/first */

import faker from 'faker';
import { Connection, getRepository } from 'typeorm';
import { initDbConnection } from '../dbConnection';
import { Feed } from '../entities/Feed';
import { Item } from '../entities/Item';
import { getNewItems } from '../feed-parser/parse-utils';
import { deleteFeedWithUrl } from '../tests/test-utils/dbQueries';
import { generateItem, generateMeta } from '../tests/test-utils/generate-feed';
import { updateFeedData } from './watcher-utils';

jest.mock('../feed-parser/parse-utils.ts', () => ({
  getNewItems: jest.fn(async () => {}),
}));

let db: Connection;

beforeAll(async () => {
  db = await initDbConnection();
});

afterAll(() => db.close());

describe('updateFeedData', () => {
  const feedUrl = faker.internet.url();
  const oldItems = [
    generateItem(new Date(Date.now() - 2 * 360000)),
    generateItem(new Date(Date.now() - 3 * 360000)),
    generateItem(new Date(Date.now() - 360000)),
  ];
  const feedMeta = generateMeta();

  beforeAll(async () => {
    const feed = await getRepository(Feed).merge(new Feed(), feedMeta, { url: feedUrl }).save();
    await Promise.all(oldItems.map((i) => Item.create({ ...i, feedId: feed.id }).save()));
  });
  afterAll(() => Promise.all([deleteFeedWithUrl(feedUrl)]));

  test("should update feed's data", async () => {
    const newItems = [generateItem(new Date(Date.now() - 1000)), generateItem(new Date(Date.now()))];
    const newMeta = {
      title: 'new Title',
      description: 'new description',
    };

    (getNewItems as jest.Mock).mockImplementation(
      async (url: string, items: Array<{ pubdate: Date; guid: string }>) => {
        expect(url).toBe(feedUrl);
        expect(items).toHaveLength(oldItems.length);
        const sorted = oldItems.sort((a, b) => b.pubdate?.getTime()! - a.pubdate?.getTime()!);
        items.forEach((i, idx) => expect(i.guid).toBe(sorted[idx].guid));
        return { feedItems: newItems, feedMeta: newMeta };
      },
    );
    await updateFeedData(feedUrl);
    expect(getNewItems).toHaveBeenCalled();
    const feedUpd = await Feed.findOneOrFail({ where: { url: feedUrl }, relations: ['items'] });
    expect(feedUpd).toMatchObject(newMeta);
    expect(feedUpd.items).toHaveLength(oldItems.length + newItems.length);
    newItems.forEach(({ guid }) => {
      expect(feedUpd.items.find((i) => guid === i.guid)).toBeTruthy();
    });
  });
});
