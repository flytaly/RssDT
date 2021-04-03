import 'reflect-metadata';
import '../dotenv.js';
import Watcher from './watcher.js';
import { initLogFiles } from '../logger.js';
import { IS_DEV } from '../constants.js';
import { initDbConnection } from '../dbConnection.js';

async function start() {
  initLogFiles({ prefix: 'watcher_', name: 'watcher' });
  const db = await initDbConnection();
  const feedWatcher = new Watcher({});
  feedWatcher.start();
  await feedWatcher.update(IS_DEV ? 0 : 4);

  if (IS_DEV) {
    await feedWatcher.cancel();
    await db.close();
  }
}

start();
