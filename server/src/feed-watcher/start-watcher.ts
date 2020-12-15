import 'reflect-metadata';
import 'dotenv-safe/config';
import Watcher from './watcher';
import { initLogFiles } from '../logger';
import { IS_DEV } from '../constants';
import { initDbConnection } from '../dbConnection';

async function start() {
    const child = initLogFiles('watcher_');
    const db = await initDbConnection();
    const feedWatcher = new Watcher({});
    feedWatcher.start();
    if (IS_DEV) {
        await feedWatcher.update();
        await feedWatcher.cancel();
        await db.close();
        child?.kill();
    }
}

start();
