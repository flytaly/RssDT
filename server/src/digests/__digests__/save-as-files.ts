import '#root/dotenv.js';
import 'reflect-metadata';

import fs from 'fs';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
import { db } from '#root/db/db.js';
import { composeDigest } from '#root/digests/compose-mail.js';
import { createDefaultUserFeed } from './utils.js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = `${__dirname}/output`;

/** Convert feeds to html digest ans save in the directory.
 * Useful for tests */
async function generateDigestsAndSave(limit = 10) {
  const feedsWithItems = await db.query.feeds.findMany({
    limit,
    with: { items: { with: { enclosures: true } } },
  });
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
      console.log(`Output dir: ${outputDir}`);
      if (html) {
        fs.writeFileSync(`${outputDir}/${filename}.html`, html);
        console.log(`saved: ${filename}.html. Items: ${feed.items?.length} `);
      }
      if (text) {
        fs.writeFileSync(`${outputDir}/${filename}.txt`, text);
        console.log(`saved: ${filename}.txt. Items: ${feed.items?.length}`);
      }
    });
  } catch (error) {
    console.log('error:', error);
  }
}

generateDigestsAndSave().catch(console.error);
