const cookieParser = require('cookie-parser');
const { Prisma } = require('prisma-binding');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';

const envFile = isDevelopment ? '.env.dev' : '.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

const createServer = require('./server');
const Watcher = require('./feed-watcher');
const authMiddleware = require('./middlewares/jwtAuth.js');
const prismaOptions = require('./prisma-options');
const { fragmentReplacements } = require('./resolvers');

require('./mail-sender/themes'); // load email themes from filesystem

const { logger, initLogFiles } = require('./logger');

initLogFiles('server_');

const db = new Prisma({ ...prismaOptions, fragmentReplacements });

const feedWatcher = new Watcher(db);

const server = createServer(db, feedWatcher);
server.express.use(cookieParser());
server.express.use(authMiddleware(db));

const opts = {
    debug: isDevelopment,
    cors: {
        credentials: true,
        origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL2],
    },
};

server.start(opts, ({ port }) => logger.info(
    `Server started, listening on port ${port} for incoming requests.`,
));
