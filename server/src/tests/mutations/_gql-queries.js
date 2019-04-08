const gql = require('graphql-tag');

const ADD_FEED_MUTATION = gql`mutation (
    $email: String!
    $feedUrl: String!,
    $feedSchedule: DigestSchedule,
    ) {
    addFeed(
        email: $email
        feedUrl: $feedUrl
        feedSchedule: $feedSchedule
    ) {
      message
    }
  }`;

const CONFIRM_SUBSCRIPTION_MUTATION = gql`mutation(
    $token: String!,
  ) {
    confirmSubscription(
      token: $token
    ){
      message
    }
  }`;

const REQUEST_PASSWORD_CHANGE_MUTATION = gql`mutation (
    $email: String!
    ) {
    requestPasswordChange(
        email: $email
    ) {
      message
    }
  }`;

const SET_PASSWORD_MUTATION = gql`mutation (
    $password: String!
    $token: String!
    ) {
    setPassword(
        password: $password
        token: $token
    ) {
      email
    }
  }`;

const SIGNIN_MUTATION = gql`mutation (
    $email: String!
    $password: String!
    ) {
    signIn(
        email: $email
        password: $password
    ) {
      message
    }
  }`;

module.exports = {
    ADD_FEED_MUTATION,
    CONFIRM_SUBSCRIPTION_MUTATION,
    REQUEST_PASSWORD_CHANGE_MUTATION,
    SET_PASSWORD_MUTATION,
    SIGNIN_MUTATION,
};
