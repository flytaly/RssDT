const createServer = require('./server');
const db = require('./bind-prisma');
const Watcher = require('./feed-watcher');

const feedWatcher = new Watcher(db, '*/2 * * * * *');
feedWatcher.start();

setTimeout(() => { // for developing
    feedWatcher.cancel();
}, 2300);

const server = createServer(db, feedWatcher);
server.start(({ port }) => console.log(
    `Server started, listening on port ${port} for incoming requests.`,
));
