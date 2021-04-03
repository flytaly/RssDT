import 'reflect-metadata';
import '../../dotenv.js';
import fs from 'fs';
import { Connection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Feed } from '#entities';
import { initDbConnection } from '../../dbConnection.js';
import { composeDigest } from '../compose-mail.js';
import { createDefaultUserFeed } from './utils.js';

const outputDir = `${__dirname}/output`;

let db: Connection;

/** Convert feeds to html digest ans save in the directory.
 * Useful for tests */
async function generateDigestsAndSave() {
  db = await initDbConnection();
  const feedsWithItems = await Feed.find({ take: 2, relations: ['items'] });
  try {
    feedsWithItems.forEach((feed, idx) => {
      const uf = createDefaultUserFeed();

      const { html, text, errors } = composeDigest(uf, feed, feed.items);
      if (errors?.length) {
        console.log('errors:', errors);
        return;
      }

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      const filename = `${idx}-${new URL(feed.url).hostname}`;
      if (html) {
        fs.writeFileSync(`${outputDir}/${filename}.html`, html);
        console.log(`saved: ${filename}.html. Items: ${feed.items.length} `);
      }
      if (text) {
        fs.writeFileSync(`${outputDir}/${filename}.txt`, text);
        console.log(`saved: ${filename}.txt. Items: ${feed.items.length}`);
      }
    });
  } catch (error) {
    console.log('error:', error);
  }
}

async function run() {
  await generateDigestsAndSave();
  await db.close();
}

run();
