import faker from 'faker';
import nock from 'nock';
import { FeedItem, FeedMeta } from '../../types';

export const generateMeta = (): FeedMeta => ({
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    link: faker.internet.url(),
    language: 'en',
    favicon: null,
    imageUrl: faker.image.imageUrl(),
    imageTitle: 'image',
});

export const generateItem = (): FeedItem => ({
    title: faker.lorem.slug(),
    description: faker.lorem.text(),
    summary: faker.lorem.text(),
    pubdate: new Date(),
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
    if (!meta) meta = generateMeta();
    if (!items) items = [generateItem()];
    if (!feedUrl) feedUrl = faker.internet.url();
    let text = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
  <channel>
    <title>${meta.title}</title>
    <description>${meta.description}</description>
    <link>${meta.link}</link>
    <language>${meta.language}</language>
    <favicon>${meta.language}</favicon>
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
