/* eslint-disable no-await-in-loop */
import PQueue from 'p-queue';
// eslint-disable-next-line import/extensions
import { Feed } from '#entities';
import 'reflect-metadata';
import { initDbConnection } from '../dbConnection.js';
import '../dotenv.js';
import { updateFeedIcons } from '../utils/updateFeedIcons.js';

async function updateIcons() {
  const conn = await initDbConnection(false);
  const take = 10;
  const concurrency = 3;
  let skip = 0;

  const queue = new PQueue({ concurrency });
  console.log('total :', await Feed.count());

  let feedsBatch = await Feed.find({ skip, take });
  while (feedsBatch.length) {
    queue.addAll(
      feedsBatch.map((f) => () => {
        console.log(`update ${f.id}: ${f.link}`);
        return updateFeedIcons(f, true);
      }),
    );
    // TODO:
    // await queue.onSizeLessThan(3);
    await queue.onIdle();
    skip += take;
    feedsBatch = await Feed.find({ skip, take });
  }
  await queue.onIdle();
  await conn.close();
}

async function updateOneIcon(id: number) {
  const conn = await initDbConnection(false);
  const f = await Feed.findOne(id);
  console.log(`update ${id}: ${f?.link}`);
  await updateFeedIcons(f, true);
  conn.close();
}

const id = process.argv.slice(2)[0];

if (id) updateOneIcon(+id);
else updateIcons();
