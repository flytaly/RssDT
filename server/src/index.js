const cookieParser = require('cookie-parser');
const createServer = require('./server');
const db = require('./bind-prisma');
const Watcher = require('./feed-watcher');
const logger = require('./logger');
const authMiddleware = require('./middlewares/jwtAuth.js');

require('./mail-sender/themes'); // load email themes from filesystem

const feedWatcher = new Watcher(db);
feedWatcher.start();

if (process.env.NODE_ENV === 'development') {
    (async () => {
        await feedWatcher.update();
        // await feedWatcher.cancel();
    })();
}

const server = createServer(db, feedWatcher);
server.express.use(cookieParser());
server.express.use(authMiddleware(db));

server.start(({ port }) => logger.info(
    `Server started, listening on port ${port} for incoming requests.`,
));
