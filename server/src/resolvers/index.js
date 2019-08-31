/* eslint-disable no-underscore-dangle */
const { extractFragmentReplacements } = require('prisma-binding');
const Mutation = require('./Mutation');
const Query = require('./Query');

const resolvers = {
    Mutation,
    Query,
    Node: {
        // to prevent warning 'Type "Node" is missing a "__resolveType" resolver...'
        // see: https://github.com/prisma/prisma/issues/2225#issuecomment-413265367
        __resolveType(obj) {
            return obj.__typename;
        },
    },
    Feed: {
        itemsCount: {
            resolve: async ({ id }, args, ctx) => {
                if (!id) return null;
                const itemsCount = await ctx.db.query.feedItemsConnection(
                    { where: { feed: { id } } },
                    '{ aggregate { count } }',
                );
                return itemsCount.aggregate.count;
            },
        },
    },
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

module.exports = {
    resolvers,
    fragmentReplacements,
};
