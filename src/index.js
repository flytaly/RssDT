const cookieParser = require('cookie-parser');
const createServer = require('./server');
const db = require('./bind-prisma');
const Watcher = require('./feed-watcher');
const logger = require('./logger');

const feedWatcher = new Watcher(db);
feedWatcher.start();

(async () => { // for developing
    await feedWatcher.update();
    await feedWatcher.cancel();
})();

const server = createServer(db, feedWatcher);
server.express.use(cookieParser());

server.start(({ port }) => logger.info(
    `Server started, listening on port ${port} for incoming requests.`,
));
