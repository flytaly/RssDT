const addFeed = require('./mutations/addFeed');
const requestPasswordChange = require('./mutations/requestPasswordChange');
const setPassword = require('./mutations/setPassword');
const signIn = require('./mutations/signIn');

const Mutations = {
    addFeed,
    requestPasswordChange,
    setPassword,
    signIn,
};

module.exports = Mutations;
