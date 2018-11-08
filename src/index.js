require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./bind-prisma');

function createServer() {
    return new GraphQLServer({
        typeDefs: 'src/schema.graphql',
        resolvers: {
            Mutation,
            Query,
        },
        context: req => ({ ...req, db }),
    });
}

const server = createServer();

server.start(({ port }) => console.log(
    `Server started, listening on port ${port} for incoming requests.`,
));
