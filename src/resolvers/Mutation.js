const addFeed = require('./mutations/addFeed');
const requestPasswordChange = require('./mutations/requestPasswordChange');
const setPassword = require('./mutations/setPassword');

const Mutations = {
    addFeed,
    requestPasswordChange,
    setPassword,
};

module.exports = Mutations;
