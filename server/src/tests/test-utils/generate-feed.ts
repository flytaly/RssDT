import faker from 'faker';
import nock from 'nock';

import {
  NewFeed,
  users,
  options,
  userFeeds,
  feeds,
  items,
  NewOptions,
  NewUser,
  NewUserFeed,
  enclosures,
} from '#root/db/schema.js';
import { db } from '#root/db/db.js';

import { DigestSchedule } from '../../types/enums.js';
import { FeedItem, FeedMeta } from '../../types/index.js';

export const generateMeta = (): FeedMeta => ({
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  link: faker.internet.url(),
  language: 'en',
  imageUrl: faker.image.imageUrl(),
  imageTitle: 'image',
});

export const generateItem = (pubdate = new Date()): FeedItem => ({
  title: faker.lorem.slug(),
  description: faker.lorem.text(),
  summary: faker.lorem.text(),
  pubdate,
  link: faker.internet.url(),
  guid: faker.internet.url(),
  imageUrl: faker.image.imageUrl(),
  enclosures: [
    {
      url: faker.image.imageUrl(),
      type: 'image/jpeg',
      length: '400',
    },
  ],
});

export const generateFeed = ({
  feedUrl,
  meta,
  feedItems: feedItems,
}: {
  feedUrl?: string;
  meta?: Partial<FeedMeta>;
  feedItems?: Partial<FeedItem>[];
} = {}) => {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  if (!meta) meta = generateMeta();
  if (!feedItems)
    feedItems = [
      generateItem(new Date(now - 2 * day)),
      generateItem(new Date(now - day)),
      generateItem(new Date(now)),
    ];
  if (!feedUrl) feedUrl = faker.internet.url();
  let text = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
  <channel>
    <title>${meta.title}</title>
    <description>${meta.description}</description>
    <link>${meta.link}</link>
    <language>${meta.language}</language>
    <image>
      <title>${meta.imageTitle}</title>
      <url>${meta.imageUrl}</url>
    </image>`;

  feedItems?.forEach((item) => {
    text += `<item>
        <title>${item.title}</title>
        <description>${item.description}</description>
        <link>${item.link}</link>
        <guid>${item.guid}</guid>
        <pubDate>${item.pubdate}</pubDate>`;

    item.enclosures?.forEach((enc) => {
      text += `<enclosure url="${enc.url}" type="${enc.type}" length="${enc.length || 0}"/>`;
    });
    text += `</item>`;
  });

  text += '</channel></rss>';

  const mockRequests = () => nock(feedUrl!).persist().get('/').reply(200, text);
  return { text, meta, items: feedItems, feedUrl, mockRequests };
};

export const generateFeedEntity = async (partialFeed: Partial<NewFeed> = {}) => {
  const createdFeeds = await db
    .insert(feeds)
    .values({
      ...generateMeta(),
      url: `${faker.internet.url()}/feed.rss`,
      activated: true,
      ...partialFeed,
    })
    .returning();

  return createdFeeds[0];
};

export const generateItemEntity = async (feedId: number, pubdate?: Date) => {
  const genItem = generateItem(pubdate);
  const encs = genItem.enclosures;
  delete genItem.enclosures;

  const createdItems = await db
    .insert(items)
    .values({ ...genItem, feedId, ...(pubdate ? { createdAt: pubdate } : {}) })
    .returning();
  const item = createdItems[0];
  if (!encs) return item;

  const encsToInsert = encs.map((e) => ({ ...e, itemId: item.id }));
  const createdEnclosures = await db.insert(enclosures).values(encsToInsert).returning();

  return { ...item, enclosures: createdEnclosures };
};

export const generateUserWithFeed = async (
  partialUser: Partial<NewUser> = {},
  partialOpts: Partial<NewOptions> = {},
  partialUserFeed: Partial<NewUserFeed> = {},
  partialFeed: Partial<NewFeed> = {},
) => {
  const createdUsers = await db
    .insert(users)
    .values({
      emailVerified: true,
      email: faker.internet.email(),
      ...partialUser,
    })
    .returning();
  const user = createdUsers[0];

  const createdOptions = await db
    .insert(options)
    .values({
      userId: user.id,
      ...partialOpts,
    })
    .returning();
  const opts = createdOptions[0];

  const feed = await generateFeedEntity(partialFeed);

  const createdUserFeeds = await db
    .insert(userFeeds)
    .values({
      schedule: DigestSchedule.daily,
      activated: true,
      feedId: feed.id,
      userId: user.id,
      unsubscribeToken: 'unsub-token',
      ...partialUserFeed,
    })
    .returning();
  const userFeed = createdUserFeeds[0];

  return { user: { ...user, options: opts }, feed, userFeed };
};
