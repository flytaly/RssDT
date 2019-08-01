const gql = require('graphql-tag');

const ADD_FEED_MUTATION = gql`mutation (
    $email: String!
    $feedUrl: String!,
    $feedSchedule: DigestSchedule,
    $locale: String,
    $timeZone: String,
    ) {
    addFeed(
        email: $email
        feedUrl: $feedUrl
        feedSchedule: $feedSchedule
        locale: $locale
        timeZone: $timeZone
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

const RESEND_ACTIVATION_LINK = gql`mutation (
  $id: ID!,
) {
  resendActivationLink(
    id: $id
  ) {
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

const REQUEST_UNSUBSCRIBE_MUTATION = gql`mutation (
    $id: ID!
  ) {
    requestUnsubscribe(
      id: $id
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
          id
          email
    }
  }`;

const SIGNOUT_MUTATION = gql`mutation{
  signOut{
    message
  }
}`;

const UPDATE_MY_FEED_MUTATION = gql`mutation (
    $data: MyFeedUpdateInput!
    $id: ID!
){
  updateMyFeed (
    data: $data
    id: $id
  ) {
    id
    schedule
  }
}`;

const UNSUBSCRIBE_MUTATION = gql`mutation (
    $token: String!
  ){
    unsubscribe (
      token: $token
    ) {
      id
    }
}`;

const UPDATE_MY_INFO_MUTATION = gql`mutation (
    $data: MyInfoUpdateInput!
  ){
    updateMyInfo (
      data: $data
    ) {
      locale
      timeZone
      dailyDigestHour
      shareEnable
      filterShare
    }
}`;


const DELETE_MY_FEED_MUTATION = gql`mutation (
    $id: ID!
){
  deleteMyFeed (
    id: $id
  ) {
    id
  }
}`;

module.exports = {
    ADD_FEED_MUTATION,
    CONFIRM_SUBSCRIPTION_MUTATION,
    DELETE_MY_FEED_MUTATION,
    RESEND_ACTIVATION_LINK,
    REQUEST_PASSWORD_CHANGE_MUTATION,
    REQUEST_UNSUBSCRIBE_MUTATION,
    SET_PASSWORD_MUTATION,
    SIGNIN_MUTATION,
    SIGNOUT_MUTATION,
    UNSUBSCRIBE_MUTATION,
    UPDATE_MY_FEED_MUTATION,
    UPDATE_MY_INFO_MUTATION,
};
