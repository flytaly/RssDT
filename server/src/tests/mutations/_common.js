/* eslint-disable import/no-extraneous-dependencies */
const cookieParser = require('cookie-parser');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const createServer = require('../../server');
const createAuthMiddleware = require('../../middlewares/jwtAuth');

jest.mock('../../mail-sender/dispatcher.js');

const deleteData = async (prisma, { email, url = '' }) => {
    if (email) {
        const userExists = await prisma.exists.User({ email });
        if (userExists) {
            await prisma.mutation.deleteUser({ where: { email } });
        }
    }
    if (url) {
        const feedExists = await prisma.exists.Feed({ url });
        if (feedExists) {
            await prisma.mutation.deleteFeed({ where: { url } });
        }
    }
};


const runServer = (db, watcher = {}) => {
    const server = createServer(db, watcher);
    server.express.use(cookieParser());
    server.express.use(createAuthMiddleware(db));
    return server.start({ port: 0 });
};

const getApolloLink = port => new HttpLink({
    uri: `http://127.0.0.1:${port}`,
    fetch,
    credentials: 'same-origin',
});


const createMockDate = () => {
    const RealDate = Date;
    const mockDate = (mockDateNow) => {
        global.Date = class extends RealDate {
            constructor(...args) {
                if (!args.length) {
                    return new RealDate(mockDateNow);
                }
                return new RealDate(...args);
            }

            static now() {
                return (new RealDate(mockDateNow)).getTime();
            }
        };
    };
    return mockDate;
};

module.exports = {
    runServer,
    getApolloLink,
    deleteData,
    createMockDate,
};
