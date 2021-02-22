import faker from 'faker';
import nock from 'nock';
import { DeepPartial } from 'typeorm';
import { Enclosure } from '../../entities/Enclosure';
import { Feed } from '../../entities/Feed';
import { Item } from '../../entities/Item';
import { Options } from '../../entities/Options';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { FeedItem, FeedMeta } from '../../types';
import { DigestSchedule } from '../../types/enums';

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
  items,
}: {
  feedUrl?: string;
  meta?: Partial<FeedMeta>;
  items?: Partial<FeedItem>[];
} = {}) => {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  if (!meta) meta = generateMeta();
  if (!items)
    items = [
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

  items?.forEach((item) => {
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
  return { text, meta, items, feedUrl, mockRequests };
};

export const generateFeedEntity = async (entityLike: DeepPartial<Feed> = {}) => {
  const feed = Feed.create({
    ...generateMeta(),
    url: `${faker.internet.url()}/feed.rss`,
    activated: true,
    ...entityLike,
  });
  return feed.save();
};

export const generateItemEntity = async (feedId: number, pubdate?: Date) => {
  const item = Item.create(generateItem(pubdate));
  if (pubdate) item.createdAt = pubdate;
  item.feedId = feedId;
  item.enclosures = item.enclosures.map((enc) => Enclosure.create({ ...enc }));
  return item.save();
};

export const generateUserWithFeed = async (
  entityLikeUser: DeepPartial<User> = {},
  entityLikeOptions: DeepPartial<Options> = {},
  entityLikeUserFeed: DeepPartial<UserFeed> = {},
  entityLikeFeed: DeepPartial<Feed> = {},
) => {
  const user = User.create({
    emailVerified: true,
    email: faker.internet.email(),
    ...entityLikeUser,
  });
  user.options = Options.create({ ...entityLikeOptions });
  const feed = await generateFeedEntity(entityLikeFeed);
  const userFeed = UserFeed.create({
    schedule: DigestSchedule.daily,
    activated: true,
    ...entityLikeUserFeed,
  });
  userFeed.user = user;
  userFeed.feed = feed;
  user.userFeeds = [userFeed];
  await user.save();
  await userFeed.save();
  return { user, feed, userFeed };
};
