const addFeed = require('./mutations/addFeed');
const requestPasswordChange = require('./mutations/requestPasswordChange');
const setPassword = require('./mutations/setPassword');
const signIn = require('./mutations/signIn');
const signOut = require('./mutations/signOut');
const confirmSubscription = require('./mutations/confirmSubscription');
const updateMyFeed = require('./mutations/updateMyFeed');

const Mutations = {
    addFeed,
    requestPasswordChange,
    setPassword,
    signIn,
    signOut,
    confirmSubscription,
    updateMyFeed,
};

module.exports = Mutations;
