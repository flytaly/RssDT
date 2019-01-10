const { Prisma } = require('prisma-binding');

const binding = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET,
});

module.exports = binding;
