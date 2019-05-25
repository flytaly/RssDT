const addFeed = require('./mutations/addFeed');
const confirmSubscription = require('./mutations/confirmSubscription');
const deleteMyFeed = require('./mutations/deleteMyFeed');
const requestPasswordChange = require('./mutations/requestPasswordChange');
const setPassword = require('./mutations/setPassword');
const signIn = require('./mutations/signIn');
const signOut = require('./mutations/signOut');
const updateMyFeed = require('./mutations/updateMyFeed');
const updateMyInfo = require('./mutations/updateMyInfo');

const Mutations = {
    addFeed,
    confirmSubscription,
    deleteMyFeed,
    requestPasswordChange,
    setPassword,
    signIn,
    signOut,
    updateMyFeed,
    updateMyInfo,
};

module.exports = Mutations;
