const { GraphQLServer } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');

/**
 * @param db connection to a database that will be injected into context to have access to it in the resolvers
 * @param watcher feed watcher instance
 */
const createServer = (db, watcher) => new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers: {
        Mutation,
        Query,
    },
    // to hide warning in tests https://github.com/prisma/prisma/issues/2225
    resolverValidationOptions: {
        requireResolversForResolveType: false,
    },
    context: req => ({ ...req, db, watcher }),
});

module.exports = createServer;
