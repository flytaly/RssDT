const { Prisma } = require('prisma-binding');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';

const envFile = isDevelopment ? '.env.dev' : '.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

const Watcher = require('./feed-watcher');
const prismaOptions = require('./prisma-options');
const { fragmentReplacements } = require('./resolvers');

require('./mail-sender/themes'); // load email themes from filesystem

const { logger, initLogFiles } = require('./logger');

initLogFiles('watcher_');

const db = new Prisma({ ...prismaOptions, fragmentReplacements });

const feedWatcher = new Watcher(db);
feedWatcher.start();
logger.info('Watcher is started');

if (isDevelopment) {
    feedWatcher.update();
}
