import 'reflect-metadata';
import '../../dotenv';
import fs from 'fs';
import { Feed } from '../../entities/Feed';
import { getFeedStream, parseFeed } from '../../feed-parser';
import { createSanitizedItem } from '../../feed-parser/filter-item';
import { composeDigest } from '../compose-mail';
import { createDefaultUserFeed } from './utils';
import { initDbConnection } from '../../dbConnection';
import { transport } from '../../mail/transport';

const outputDir = `${__dirname}/output`;

async function fetchAndSave() {
  const db = await initDbConnection();

  const args = process.argv.slice(2);
  const url: string = args[0];
  if (!url) {
    console.error('No url provided. Pass url as the first argument`');
  }
  const email = args[1] || null;

  const { feedStream, feedUrl } = await getFeedStream(url, { timeout: 6000 }, true);
  console.log(`actual feed url ${feedUrl}`);

  const { feedMeta, feedItems } = await parseFeed(feedStream);
  if (!feedMeta) throw new Error('Not a feed');
  const feed = Feed.create({ url });
  feed.addMeta(feedMeta);
  feed.items = feedItems.map((item) => createSanitizedItem(item, feed.id));

  if (!feed.items.length) return console.error('No items');

  const userFeed = createDefaultUserFeed();
  const { html, text, errors } = composeDigest(userFeed, feed, feed.items);
  if (errors?.length) return console.log('errors:', errors);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const filename = `${new URL(feed.url).hostname}`;
  if (html) {
    fs.writeFileSync(`${outputDir}/${filename}.html`, html);
    console.log(`saved: ${filename}.html. Items: ${feed.items.length} `);
  }
  if (text) {
    fs.writeFileSync(`${outputDir}/${filename}.txt`, text);
    console.log(`saved: ${filename}.txt. Items: ${feed.items.length}`);
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
  return db.close();
}

fetchAndSave();
