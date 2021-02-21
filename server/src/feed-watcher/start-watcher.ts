import 'reflect-metadata';
import '../dotenv';
import Watcher from './watcher';
import { initLogFiles } from '../logger';
import { IS_DEV } from '../constants';
import { initDbConnection } from '../dbConnection';

async function start() {
  initLogFiles({ prefix: 'watcher_', name: 'watcher' });
  const db = await initDbConnection();
  const feedWatcher = new Watcher({});
  feedWatcher.start();
  await feedWatcher.update();

  if (IS_DEV) {
    await feedWatcher.cancel();
    await db.close();
  }
}

start();
