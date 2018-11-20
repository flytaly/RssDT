const createServer = require('./server');
const db = require('./bind-prisma');

const server = createServer(db);
server.start(({ port }) => console.log(
    `Server started, listening on port ${port} for incoming requests.`,
));
