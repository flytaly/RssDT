import '#root/dotenv.js';
import 'reflect-metadata';

// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
import { Feed, ItemWithEnclosures } from '#root/db/schema.js';
import { composeDigest } from '#root/digests/compose-mail.js';
import { createSanitizedItem, filterMeta } from '#root/feed-parser/filter-item.js';
import { getFeedStream, parseFeed } from '#root/feed-parser/index.js';
import { transport } from '#root/mail/transport.js';
import fs from 'node:fs';
import { createDefaultUserFeed } from './utils.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
// const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = `${__dirname}/output`;

async function fetchAndSave(url: string, email?: string) {
  const { feedStream, feedUrl } = await getFeedStream(url, { timeout: 6000 }, true);
  console.log(`actual feed url ${feedUrl}`);

  const { feedMeta, feedItems } = await parseFeed(feedStream);
  if (!feedMeta) throw new Error('Not a feed');

  const feed: Partial<Feed> = {
    url,
    ...filterMeta(feedMeta),
  };
  const itemList = feedItems.map((item) =>
    createSanitizedItem(item, feed.id),
  ) as ItemWithEnclosures[];

  if (!itemList.length) return console.error('No items');

  const userFeed = createDefaultUserFeed();
  const { html, text, errors } = composeDigest(userFeed, feed as Feed, itemList);
  if (errors?.length) return console.log('errors:', errors);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const filename = `${new URL(feed.url || '').hostname}`;
  console.log(`dir: ${outputDir}`);
  if (html) {
    fs.writeFileSync(`${outputDir}/${filename}.html`, html);
    console.log(`saved: ${filename}.html. Items: ${itemList.length} `);
  }
  if (text) {
    fs.writeFileSync(`${outputDir}/${filename}.txt`, text);
    console.log(`saved: ${filename}.txt. Items: ${itemList.length}`);
  }

  if (email) {
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'test',
      text,
      html,
    });
  }
}

const args = process.argv.slice(2);
const url: string = args[0];
if (!url) {
  console.error('No url provided. Pass url as the first argument`');
}
fetchAndSave(url, args[1]).catch((e) => console.error(e.message));
