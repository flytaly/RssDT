const { forwardTo } = require('prisma-binding');

const Queries = {
    user: forwardTo('db'),
};

module.exports = Queries;
