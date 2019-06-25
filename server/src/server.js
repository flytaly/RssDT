/* eslint-disable func-names, no-param-reassign, class-methods-use-this, no-underscore-dangle */
const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');
const { GraphQLServer } = require('graphql-yoga');
const { AuthenticationError, ForbiddenError } = require('apollo-server');
const { resolvers } = require('./resolvers');

// https://www.apollographql.com/docs/graphql-tools/schema-directives
class AuthDirective extends SchemaDirectiveVisitor {
    visitObject(/* type */) {
    }

    // Visitor methods for nested types like fields and arguments
    // also receive a details object that provides information about
    // the parent and grandparent types.
    visitFieldDefinition(field/* , details */) {
        const { resolve = defaultFieldResolver } = field;
        const { permission } = this.args;
        field.resolve = async function (...args) {
            const { request } = args[2];
            const { user } = request;
            if (!user) { return new AuthenticationError('Authentication is required'); }
            if (!user.permissions.includes(permission)) { return new ForbiddenError('Access Denied'); }
            const result = await resolve.apply(this, args);
            return result;
        };
    }
}

/**
 * @param db connection to a database that will be injected into context to have access to it in the resolvers
 * @param watcher feed watcher instance
 */
const createServer = (db, watcher) => new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers,
    schemaDirectives: {
        isAuthenticated: AuthDirective,
    },
    context: req => ({ ...req, db, watcher }),
});

module.exports = createServer;
