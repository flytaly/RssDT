const { Prisma } = require('prisma-binding');
const prismaOptions = require('./prisma-options');

const binding = new Prisma(prismaOptions);

module.exports = binding;
