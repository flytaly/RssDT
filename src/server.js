const { GraphQLServer } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');

/**
 * @param db connection to a database that will be injected into context to have access to it in the resolvers
 */
const createServer = db => new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers: {
        Mutation,
        Query,
    },
    context: req => ({ ...req, db }),
});

module.exports = createServer;
