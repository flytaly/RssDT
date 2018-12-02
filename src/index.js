const createServer = require('./server');
const db = require('./bind-prisma');
const Watcher = require('./feed-watcher');

const feedWatcher = new Watcher(db);
feedWatcher.start();

(async () => { // for developing
    await feedWatcher.update();
    await feedWatcher.cancel();
})();

const server = createServer(db, feedWatcher);
server.start(({ port }) => console.log(
    `Server started, listening on port ${port} for incoming requests.`,
));
