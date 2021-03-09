import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type Query = {
  __typename?: 'Query';
  users?: Maybe<Array<User>>;
  me?: Maybe<User>;
  myOptions: Options;
  myFeeds?: Maybe<Array<UserFeed>>;
  getFeedInfoByToken?: Maybe<UserFeed>;
  myFeedItems: PaginatedItemsResponse;
};


export type QueryGetFeedInfoByTokenArgs = {
  id: Scalars['String'];
  token: Scalars['String'];
};


export type QueryMyFeedItemsArgs = {
  feedId: Scalars['Float'];
  skip?: Maybe<Scalars['Float']>;
  take?: Maybe<Scalars['Float']>;
  filter?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['Float'];
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  role: Scalars['String'];
  locale: Scalars['String'];
  timeZone: Scalars['String'];
  userFeeds?: Maybe<Array<UserFeed>>;
  options: Options;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  feeds: Array<UserFeed>;
};

export type UserFeed = {
  __typename?: 'UserFeed';
  id: Scalars['Float'];
  user: User;
  feed: Feed;
  activated: Scalars['Boolean'];
  title?: Maybe<Scalars['String']>;
  schedule: DigestSchedule;
  withContentTable: TernaryState;
  itemBody: TernaryState;
  attachments: TernaryState;
  theme: Theme;
  filter?: Maybe<Scalars['String']>;
  lastDigestSentAt?: Maybe<Scalars['DateTime']>;
  lastViewedItemDate?: Maybe<Scalars['DateTime']>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  newItemsCount: Scalars['Float'];
};

export type Feed = {
  __typename?: 'Feed';
  id: Scalars['Float'];
  url: Scalars['String'];
  link?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  favicon?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  imageTitle?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  lastSuccessfulUpd: Scalars['DateTime'];
  lastPubdate?: Maybe<Scalars['DateTime']>;
  userFeeds?: Maybe<Array<UserFeed>>;
};


export enum DigestSchedule {
  Realtime = 'realtime',
  Everyhour = 'everyhour',
  Every2hours = 'every2hours',
  Every3hours = 'every3hours',
  Every6hours = 'every6hours',
  Every12hours = 'every12hours',
  Daily = 'daily',
  Disable = 'disable'
}

export enum TernaryState {
  Enable = 'enable',
  Disable = 'disable',
  Default = 'default'
}

export enum Theme {
  Default = 'default',
  Text = 'text'
}

export type Options = {
  __typename?: 'Options';
  dailyDigestHour: Scalars['Float'];
  withContentTableDefault: Scalars['Boolean'];
  itemBodyDefault: Scalars['Boolean'];
  attachmentsDefault?: Maybe<Scalars['Boolean']>;
  themeDefault: Theme;
  customSubject?: Maybe<Scalars['String']>;
  shareEnable: Scalars['Boolean'];
  shareList?: Maybe<Array<ShareId>>;
};

export enum ShareId {
  Pocket = 'pocket',
  Evernote = 'evernote',
  Trello = 'trello'
}

export type PaginatedItemsResponse = {
  __typename?: 'PaginatedItemsResponse';
  items: Array<Item>;
  hasMore: Scalars['Boolean'];
};

export type Item = {
  __typename?: 'Item';
  id: Scalars['Float'];
  guid?: Maybe<Scalars['String']>;
  pubdate?: Maybe<Scalars['DateTime']>;
  link?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  summary?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  feed: Feed;
  enclosures?: Maybe<Array<Enclosure>>;
  createdAt: Scalars['DateTime'];
};

export type Enclosure = {
  __typename?: 'Enclosure';
  url: Scalars['String'];
  length?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  register: UserResponse;
  requestEmailVerification: Scalars['Boolean'];
  requestPasswordReset: MessageResponse;
  resetPassword: UserResponse;
  verifyEmail: UserResponse;
  login: UserResponse;
  logout: Scalars['Boolean'];
  updateUserInfo: User;
  setOptions: OptionsResponse;
  addFeedWithEmail?: Maybe<UserFeedResponse>;
  addFeedToCurrentUser: UserFeedResponse;
  activateFeed: UserFeedResponse;
  setFeedActivated: UserFeedResponse;
  deleteMyFeeds: DeletedFeedResponse;
  setFeedOptions: UserFeedResponse;
  unsubscribeByToken: Scalars['Boolean'];
  setLastViewedItemDate?: Maybe<UserFeed>;
  feedback?: Maybe<FeedbackResponse>;
};


export type MutationRegisterArgs = {
  userInfo?: Maybe<UserInfoInput>;
  input: EmailPasswordInput;
};


export type MutationRequestPasswordResetArgs = {
  email: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  input: PasswordResetInput;
};


export type MutationVerifyEmailArgs = {
  userId: Scalars['String'];
  token: Scalars['String'];
};


export type MutationLoginArgs = {
  input: EmailPasswordInput;
};


export type MutationUpdateUserInfoArgs = {
  userInfo: UserInfoInput;
};


export type MutationSetOptionsArgs = {
  opts: OptionsInput;
};


export type MutationAddFeedWithEmailArgs = {
  feedOpts?: Maybe<UserFeedOptionsInput>;
  userInfo?: Maybe<UserInfoInput>;
  input: AddFeedEmailInput;
};


export type MutationAddFeedToCurrentUserArgs = {
  feedOpts?: Maybe<UserFeedOptionsInput>;
  input: AddFeedInput;
};


export type MutationActivateFeedArgs = {
  userFeedId: Scalars['String'];
  token: Scalars['String'];
};


export type MutationSetFeedActivatedArgs = {
  userFeedId: Scalars['Float'];
};


export type MutationDeleteMyFeedsArgs = {
  ids: Array<Scalars['Float']>;
};


export type MutationSetFeedOptionsArgs = {
  opts: UserFeedOptionsInput;
  id: Scalars['Float'];
};


export type MutationUnsubscribeByTokenArgs = {
  id: Scalars['String'];
  token: Scalars['String'];
};


export type MutationSetLastViewedItemDateArgs = {
  itemId: Scalars['Float'];
  userFeedId: Scalars['Float'];
};


export type MutationFeedbackArgs = {
  input: FeedbackInput;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<ArgumentError>>;
  user?: Maybe<User>;
};

export type ArgumentError = {
  __typename?: 'ArgumentError';
  argument?: Maybe<Scalars['String']>;
  message: Scalars['String'];
};

export type UserInfoInput = {
  locale?: Maybe<Scalars['String']>;
  timeZone?: Maybe<Scalars['String']>;
};

export type EmailPasswordInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type MessageResponse = {
  __typename?: 'MessageResponse';
  message: Scalars['String'];
};

export type PasswordResetInput = {
  password: Scalars['String'];
  token: Scalars['String'];
  userId: Scalars['String'];
};

export type OptionsResponse = {
  __typename?: 'OptionsResponse';
  errors?: Maybe<Array<ArgumentError>>;
  options?: Maybe<Options>;
};

export type OptionsInput = {
  dailyDigestHour?: Maybe<Scalars['Float']>;
  customSubject?: Maybe<Scalars['String']>;
  shareList?: Maybe<Array<Scalars['String']>>;
  shareEnable?: Maybe<Scalars['Boolean']>;
  withContentTableDefault?: Maybe<Scalars['Boolean']>;
  itemBodyDefault?: Maybe<Scalars['Boolean']>;
  attachmentsDefault?: Maybe<Scalars['Boolean']>;
  themeDefault?: Maybe<Scalars['String']>;
};

export type UserFeedResponse = {
  __typename?: 'UserFeedResponse';
  errors?: Maybe<Array<ArgumentError>>;
  userFeed?: Maybe<UserFeed>;
};

export type UserFeedOptionsInput = {
  title?: Maybe<Scalars['String']>;
  schedule?: Maybe<Scalars['String']>;
  withContentTable?: Maybe<Scalars['String']>;
  itemBody?: Maybe<Scalars['String']>;
  attachments?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
};

export type AddFeedEmailInput = {
  feedUrl: Scalars['String'];
  email: Scalars['String'];
};

export type AddFeedInput = {
  feedUrl: Scalars['String'];
};

export type DeletedFeedResponse = {
  __typename?: 'DeletedFeedResponse';
  errors?: Maybe<Array<ArgumentError>>;
  ids?: Maybe<Array<Scalars['String']>>;
};

export type FeedbackResponse = {
  __typename?: 'FeedbackResponse';
  errors?: Maybe<Array<ArgumentError>>;
  success?: Maybe<Scalars['Boolean']>;
};

export type FeedbackInput = {
  email: Scalars['String'];
  text: Scalars['String'];
};

export type FeedFieldsFragment = (
  { __typename?: 'Feed' }
  & Pick<Feed, 'id' | 'url' | 'link' | 'title' | 'description' | 'language' | 'favicon' | 'imageUrl' | 'imageTitle' | 'lastSuccessfulUpd' | 'lastPubdate' | 'createdAt' | 'updatedAt'>
);

export type ItemFieldsFragment = (
  { __typename?: 'Item' }
  & Pick<Item, 'id' | 'guid' | 'pubdate' | 'link' | 'title' | 'description' | 'summary' | 'imageUrl' | 'createdAt'>
  & { enclosures?: Maybe<Array<(
    { __typename?: 'Enclosure' }
    & Pick<Enclosure, 'url' | 'length' | 'type'>
  )>> }
);

export type OptionsFieldsFragment = (
  { __typename?: 'Options' }
  & Pick<Options, 'dailyDigestHour' | 'withContentTableDefault' | 'itemBodyDefault' | 'attachmentsDefault' | 'themeDefault' | 'customSubject' | 'shareEnable' | 'shareList'>
);

export type UserFeedFieldsFragment = (
  { __typename?: 'UserFeed' }
  & Pick<UserFeed, 'id' | 'activated' | 'title' | 'schedule' | 'withContentTable' | 'itemBody' | 'attachments' | 'theme' | 'filter' | 'lastViewedItemDate' | 'lastDigestSentAt' | 'newItemsCount' | 'createdAt' | 'updatedAt'>
);

export type UserFieldsFragment = (
  { __typename?: 'User' }
  & Pick<User, 'id' | 'role' | 'email' | 'emailVerified' | 'locale' | 'timeZone'>
);

export type UsualUserResponseFragment = (
  { __typename?: 'UserResponse' }
  & { user?: Maybe<(
    { __typename?: 'User' }
    & UserFieldsFragment
  )>, errors?: Maybe<Array<(
    { __typename?: 'ArgumentError' }
    & Pick<ArgumentError, 'message' | 'argument'>
  )>> }
);

export type ActivateFeedMutationVariables = Exact<{
  token: Scalars['String'];
  userFeedId: Scalars['String'];
}>;


export type ActivateFeedMutation = (
  { __typename?: 'Mutation' }
  & { activateFeed: (
    { __typename?: 'UserFeedResponse' }
    & { userFeed?: Maybe<(
      { __typename?: 'UserFeed' }
      & { feed: (
        { __typename?: 'Feed' }
        & Pick<Feed, 'id' | 'url' | 'title'>
      ) }
      & UserFeedFieldsFragment
    )>, errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message'>
    )>> }
  ) }
);

export type AddFeedToCurrentUserMutationVariables = Exact<{
  feedOpts?: Maybe<UserFeedOptionsInput>;
  input: AddFeedInput;
}>;


export type AddFeedToCurrentUserMutation = (
  { __typename?: 'Mutation' }
  & { addFeedToCurrentUser: (
    { __typename?: 'UserFeedResponse' }
    & { userFeed?: Maybe<(
      { __typename?: 'UserFeed' }
      & Pick<UserFeed, 'id' | 'activated'>
      & { feed: (
        { __typename?: 'Feed' }
        & Pick<Feed, 'id' | 'url'>
      ) }
    )>, errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message' | 'argument'>
    )>> }
  ) }
);

export type AddFeedWithEmailMutationVariables = Exact<{
  feedOpts?: Maybe<UserFeedOptionsInput>;
  userInfo?: Maybe<UserInfoInput>;
  input: AddFeedEmailInput;
}>;


export type AddFeedWithEmailMutation = (
  { __typename?: 'Mutation' }
  & { addFeedWithEmail?: Maybe<(
    { __typename?: 'UserFeedResponse' }
    & { userFeed?: Maybe<(
      { __typename?: 'UserFeed' }
      & { feed: (
        { __typename?: 'Feed' }
        & Pick<Feed, 'id' | 'url' | 'title'>
      ) }
      & UserFeedFieldsFragment
    )>, errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message' | 'argument'>
    )>> }
  )> }
);

export type DeleteMyFeedsMutationVariables = Exact<{
  ids: Array<Scalars['Float']> | Scalars['Float'];
}>;


export type DeleteMyFeedsMutation = (
  { __typename?: 'Mutation' }
  & { deleteMyFeeds: (
    { __typename?: 'DeletedFeedResponse' }
    & Pick<DeletedFeedResponse, 'ids'>
    & { errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message'>
    )>> }
  ) }
);

export type SendFeedbackMutationVariables = Exact<{
  input: FeedbackInput;
}>;


export type SendFeedbackMutation = (
  { __typename?: 'Mutation' }
  & { feedback?: Maybe<(
    { __typename?: 'FeedbackResponse' }
    & Pick<FeedbackResponse, 'success'>
    & { errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message'>
    )>> }
  )> }
);

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'UserResponse' }
    & UsualUserResponseFragment
  ) }
);

export type RegisterMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'UserResponse' }
    & UsualUserResponseFragment
  ) }
);

export type RequestEmailVerificationMutationVariables = Exact<{ [key: string]: never; }>;


export type RequestEmailVerificationMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'requestEmailVerification'>
);

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type RequestPasswordResetMutation = (
  { __typename?: 'Mutation' }
  & { requestPasswordReset: (
    { __typename?: 'MessageResponse' }
    & Pick<MessageResponse, 'message'>
  ) }
);

export type ResetPasswordMutationVariables = Exact<{
  input: PasswordResetInput;
}>;


export type ResetPasswordMutation = (
  { __typename?: 'Mutation' }
  & { resetPassword: (
    { __typename?: 'UserResponse' }
    & { user?: Maybe<(
      { __typename?: 'User' }
      & UserFieldsFragment
    )>, errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message'>
    )>> }
  ) }
);

export type SetFeedOptionsMutationVariables = Exact<{
  id: Scalars['Float'];
  opts: UserFeedOptionsInput;
}>;


export type SetFeedOptionsMutation = (
  { __typename?: 'Mutation' }
  & { setFeedOptions: (
    { __typename?: 'UserFeedResponse' }
    & { userFeed?: Maybe<(
      { __typename?: 'UserFeed' }
      & UserFeedFieldsFragment
    )>, errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message'>
    )>> }
  ) }
);

export type SetLastViewedItemDateMutationVariables = Exact<{
  itemId: Scalars['Float'];
  userFeedId: Scalars['Float'];
}>;


export type SetLastViewedItemDateMutation = (
  { __typename?: 'Mutation' }
  & { setLastViewedItemDate?: Maybe<(
    { __typename?: 'UserFeed' }
    & Pick<UserFeed, 'id' | 'lastViewedItemDate' | 'newItemsCount'>
  )> }
);

export type SetOptionsMutationVariables = Exact<{
  opts: OptionsInput;
}>;


export type SetOptionsMutation = (
  { __typename?: 'Mutation' }
  & { setOptions: (
    { __typename?: 'OptionsResponse' }
    & { options?: Maybe<(
      { __typename?: 'Options' }
      & OptionsFieldsFragment
    )>, errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message' | 'argument'>
    )>> }
  ) }
);

export type UnsubscribeByTokenMutationVariables = Exact<{
  token: Scalars['String'];
  id: Scalars['String'];
}>;


export type UnsubscribeByTokenMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'unsubscribeByToken'>
);

export type UpdateUserInfoMutationVariables = Exact<{
  userInfo: UserInfoInput;
}>;


export type UpdateUserInfoMutation = (
  { __typename?: 'Mutation' }
  & { updateUserInfo: (
    { __typename?: 'User' }
    & Pick<User, 'timeZone' | 'locale'>
  ) }
);

export type VerifyEmailMutationVariables = Exact<{
  userId: Scalars['String'];
  token: Scalars['String'];
}>;


export type VerifyEmailMutation = (
  { __typename?: 'Mutation' }
  & { verifyEmail: (
    { __typename?: 'UserResponse' }
    & { user?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'email' | 'emailVerified'>
    )>, errors?: Maybe<Array<(
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message'>
    )>> }
  ) }
);

export type GetFeedInfoByTokenQueryVariables = Exact<{
  id: Scalars['String'];
  token: Scalars['String'];
}>;


export type GetFeedInfoByTokenQuery = (
  { __typename?: 'Query' }
  & { getFeedInfoByToken?: Maybe<(
    { __typename?: 'UserFeed' }
    & { feed: (
      { __typename?: 'Feed' }
      & Pick<Feed, 'title' | 'url'>
    ) }
  )> }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & UserFieldsFragment
  )> }
);

export type MeWithFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeWithFeedsQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & { feeds: Array<(
      { __typename?: 'UserFeed' }
      & Pick<UserFeed, 'activated' | 'createdAt'>
      & { feed: (
        { __typename?: 'Feed' }
        & FeedFieldsFragment
      ) }
    )> }
    & UserFieldsFragment
  )> }
);

export type MeWithOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeWithOptionsQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & { options: (
      { __typename?: 'Options' }
      & OptionsFieldsFragment
    ) }
    & UserFieldsFragment
  )> }
);

export type MyFeedItemsQueryVariables = Exact<{
  skip?: Maybe<Scalars['Float']>;
  take?: Maybe<Scalars['Float']>;
  feedId: Scalars['Float'];
  filter?: Maybe<Scalars['String']>;
}>;


export type MyFeedItemsQuery = (
  { __typename?: 'Query' }
  & { myFeedItems: (
    { __typename?: 'PaginatedItemsResponse' }
    & Pick<PaginatedItemsResponse, 'hasMore'>
    & { items: Array<(
      { __typename?: 'Item' }
      & ItemFieldsFragment
    )> }
  ) }
);

export type MyFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFeedsQuery = (
  { __typename?: 'Query' }
  & { myFeeds?: Maybe<Array<(
    { __typename?: 'UserFeed' }
    & { feed: (
      { __typename?: 'Feed' }
      & FeedFieldsFragment
    ) }
    & UserFeedFieldsFragment
  )>> }
);

export type MyOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOptionsQuery = (
  { __typename?: 'Query' }
  & { myOptions: (
    { __typename?: 'Options' }
    & OptionsFieldsFragment
  ) }
);

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = (
  { __typename?: 'Query' }
  & { users?: Maybe<Array<(
    { __typename?: 'User' }
    & UserFieldsFragment
  )>> }
);

export const FeedFieldsFragmentDoc = gql`
    fragment FeedFields on Feed {
  id
  url
  link
  title
  description
  language
  favicon
  imageUrl
  imageTitle
  lastSuccessfulUpd
  lastPubdate
  createdAt
  updatedAt
}
    `;
export const ItemFieldsFragmentDoc = gql`
    fragment ItemFields on Item {
  id
  guid
  pubdate
  link
  title
  description
  summary
  imageUrl
  enclosures {
    url
    length
    type
  }
  createdAt
}
    `;
export const OptionsFieldsFragmentDoc = gql`
    fragment OptionsFields on Options {
  dailyDigestHour
  withContentTableDefault
  itemBodyDefault
  attachmentsDefault
  themeDefault
  customSubject
  shareEnable
  shareList
}
    `;
export const UserFeedFieldsFragmentDoc = gql`
    fragment UserFeedFields on UserFeed {
  id
  activated
  title
  schedule
  withContentTable
  itemBody
  attachments
  theme
  filter
  lastViewedItemDate
  lastDigestSentAt
  newItemsCount
  createdAt
  updatedAt
}
    `;
export const UserFieldsFragmentDoc = gql`
    fragment UserFields on User {
  id
  role
  email
  emailVerified
  locale
  timeZone
}
    `;
export const UsualUserResponseFragmentDoc = gql`
    fragment UsualUserResponse on UserResponse {
  user {
    ...UserFields
  }
  errors {
    message
    argument
  }
}
    ${UserFieldsFragmentDoc}`;
export const ActivateFeedDocument = gql`
    mutation activateFeed($token: String!, $userFeedId: String!) {
  activateFeed(token: $token, userFeedId: $userFeedId) {
    userFeed {
      ...UserFeedFields
      feed {
        id
        url
        title
      }
    }
    errors {
      message
    }
  }
}
    ${UserFeedFieldsFragmentDoc}`;
export const AddFeedToCurrentUserDocument = gql`
    mutation addFeedToCurrentUser($feedOpts: UserFeedOptionsInput, $input: AddFeedInput!) {
  addFeedToCurrentUser(input: $input, feedOpts: $feedOpts) {
    userFeed {
      id
      activated
      feed {
        id
        url
      }
    }
    errors {
      message
      argument
    }
  }
}
    `;
export const AddFeedWithEmailDocument = gql`
    mutation addFeedWithEmail($feedOpts: UserFeedOptionsInput, $userInfo: UserInfoInput, $input: AddFeedEmailInput!) {
  addFeedWithEmail(input: $input, userInfo: $userInfo, feedOpts: $feedOpts) {
    userFeed {
      ...UserFeedFields
      feed {
        id
        url
        title
      }
    }
    errors {
      message
      argument
    }
  }
}
    ${UserFeedFieldsFragmentDoc}`;
export const DeleteMyFeedsDocument = gql`
    mutation deleteMyFeeds($ids: [Float!]!) {
  deleteMyFeeds(ids: $ids) {
    ids
    errors {
      message
    }
  }
}
    `;
export const SendFeedbackDocument = gql`
    mutation sendFeedback($input: FeedbackInput!) {
  feedback(input: $input) {
    success
    errors {
      message
    }
  }
}
    `;
export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  login(input: {email: $email, password: $password}) {
    ...UsualUserResponse
  }
}
    ${UsualUserResponseFragmentDoc}`;
export const RegisterDocument = gql`
    mutation register($email: String!, $password: String!) {
  register(input: {email: $email, password: $password}) {
    ...UsualUserResponse
  }
}
    ${UsualUserResponseFragmentDoc}`;
export const RequestEmailVerificationDocument = gql`
    mutation requestEmailVerification {
  requestEmailVerification
}
    `;
export const RequestPasswordResetDocument = gql`
    mutation requestPasswordReset($email: String!) {
  requestPasswordReset(email: $email) {
    message
  }
}
    `;
export const ResetPasswordDocument = gql`
    mutation resetPassword($input: PasswordResetInput!) {
  resetPassword(input: $input) {
    user {
      ...UserFields
    }
    errors {
      message
    }
  }
}
    ${UserFieldsFragmentDoc}`;
export const SetFeedOptionsDocument = gql`
    mutation setFeedOptions($id: Float!, $opts: UserFeedOptionsInput!) {
  setFeedOptions(id: $id, opts: $opts) {
    userFeed {
      ...UserFeedFields
    }
    errors {
      message
    }
  }
}
    ${UserFeedFieldsFragmentDoc}`;
export const SetLastViewedItemDateDocument = gql`
    mutation setLastViewedItemDate($itemId: Float!, $userFeedId: Float!) {
  setLastViewedItemDate(itemId: $itemId, userFeedId: $userFeedId) {
    id
    lastViewedItemDate
    newItemsCount
  }
}
    `;
export const SetOptionsDocument = gql`
    mutation setOptions($opts: OptionsInput!) {
  setOptions(opts: $opts) {
    options {
      ...OptionsFields
    }
    errors {
      message
      argument
    }
  }
}
    ${OptionsFieldsFragmentDoc}`;
export const UnsubscribeByTokenDocument = gql`
    mutation unsubscribeByToken($token: String!, $id: String!) {
  unsubscribeByToken(token: $token, id: $id)
}
    `;
export const UpdateUserInfoDocument = gql`
    mutation updateUserInfo($userInfo: UserInfoInput!) {
  updateUserInfo(userInfo: $userInfo) {
    timeZone
    locale
  }
}
    `;
export const VerifyEmailDocument = gql`
    mutation verifyEmail($userId: String!, $token: String!) {
  verifyEmail(userId: $userId, token: $token) {
    user {
      id
      email
      emailVerified
    }
    errors {
      message
    }
  }
}
    `;
export const GetFeedInfoByTokenDocument = gql`
    query getFeedInfoByToken($id: String!, $token: String!) {
  getFeedInfoByToken(id: $id, token: $token) {
    feed {
      title
      url
    }
  }
}
    `;
export const MeDocument = gql`
    query me {
  me {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
export const MeWithFeedsDocument = gql`
    query meWithFeeds {
  me {
    ...UserFields
    feeds {
      activated
      createdAt
      feed {
        ...FeedFields
      }
    }
  }
}
    ${UserFieldsFragmentDoc}
${FeedFieldsFragmentDoc}`;
export const MeWithOptionsDocument = gql`
    query meWithOptions {
  me {
    ...UserFields
    options {
      ...OptionsFields
    }
  }
}
    ${UserFieldsFragmentDoc}
${OptionsFieldsFragmentDoc}`;
export const MyFeedItemsDocument = gql`
    query myFeedItems($skip: Float, $take: Float, $feedId: Float!, $filter: String) {
  myFeedItems(skip: $skip, take: $take, feedId: $feedId, filter: $filter) {
    items {
      ...ItemFields
    }
    hasMore
  }
}
    ${ItemFieldsFragmentDoc}`;
export const MyFeedsDocument = gql`
    query myFeeds {
  myFeeds {
    ...UserFeedFields
    feed {
      ...FeedFields
    }
  }
}
    ${UserFeedFieldsFragmentDoc}
${FeedFieldsFragmentDoc}`;
export const MyOptionsDocument = gql`
    query myOptions {
  myOptions {
    ...OptionsFields
  }
}
    ${OptionsFieldsFragmentDoc}`;
export const UsersDocument = gql`
    query users {
  users {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    activateFeed(variables: ActivateFeedMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ActivateFeedMutation> {
      return withWrapper(() => client.request<ActivateFeedMutation>(print(ActivateFeedDocument), variables, requestHeaders));
    },
    addFeedToCurrentUser(variables: AddFeedToCurrentUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddFeedToCurrentUserMutation> {
      return withWrapper(() => client.request<AddFeedToCurrentUserMutation>(print(AddFeedToCurrentUserDocument), variables, requestHeaders));
    },
    addFeedWithEmail(variables: AddFeedWithEmailMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddFeedWithEmailMutation> {
      return withWrapper(() => client.request<AddFeedWithEmailMutation>(print(AddFeedWithEmailDocument), variables, requestHeaders));
    },
    deleteMyFeeds(variables: DeleteMyFeedsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteMyFeedsMutation> {
      return withWrapper(() => client.request<DeleteMyFeedsMutation>(print(DeleteMyFeedsDocument), variables, requestHeaders));
    },
    sendFeedback(variables: SendFeedbackMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SendFeedbackMutation> {
      return withWrapper(() => client.request<SendFeedbackMutation>(print(SendFeedbackDocument), variables, requestHeaders));
    },
    login(variables: LoginMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LoginMutation> {
      return withWrapper(() => client.request<LoginMutation>(print(LoginDocument), variables, requestHeaders));
    },
    register(variables: RegisterMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RegisterMutation> {
      return withWrapper(() => client.request<RegisterMutation>(print(RegisterDocument), variables, requestHeaders));
    },
    requestEmailVerification(variables?: RequestEmailVerificationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RequestEmailVerificationMutation> {
      return withWrapper(() => client.request<RequestEmailVerificationMutation>(print(RequestEmailVerificationDocument), variables, requestHeaders));
    },
    requestPasswordReset(variables: RequestPasswordResetMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RequestPasswordResetMutation> {
      return withWrapper(() => client.request<RequestPasswordResetMutation>(print(RequestPasswordResetDocument), variables, requestHeaders));
    },
    resetPassword(variables: ResetPasswordMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ResetPasswordMutation> {
      return withWrapper(() => client.request<ResetPasswordMutation>(print(ResetPasswordDocument), variables, requestHeaders));
    },
    setFeedOptions(variables: SetFeedOptionsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetFeedOptionsMutation> {
      return withWrapper(() => client.request<SetFeedOptionsMutation>(print(SetFeedOptionsDocument), variables, requestHeaders));
    },
    setLastViewedItemDate(variables: SetLastViewedItemDateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetLastViewedItemDateMutation> {
      return withWrapper(() => client.request<SetLastViewedItemDateMutation>(print(SetLastViewedItemDateDocument), variables, requestHeaders));
    },
    setOptions(variables: SetOptionsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetOptionsMutation> {
      return withWrapper(() => client.request<SetOptionsMutation>(print(SetOptionsDocument), variables, requestHeaders));
    },
    unsubscribeByToken(variables: UnsubscribeByTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UnsubscribeByTokenMutation> {
      return withWrapper(() => client.request<UnsubscribeByTokenMutation>(print(UnsubscribeByTokenDocument), variables, requestHeaders));
    },
    updateUserInfo(variables: UpdateUserInfoMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateUserInfoMutation> {
      return withWrapper(() => client.request<UpdateUserInfoMutation>(print(UpdateUserInfoDocument), variables, requestHeaders));
    },
    verifyEmail(variables: VerifyEmailMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<VerifyEmailMutation> {
      return withWrapper(() => client.request<VerifyEmailMutation>(print(VerifyEmailDocument), variables, requestHeaders));
    },
    getFeedInfoByToken(variables: GetFeedInfoByTokenQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetFeedInfoByTokenQuery> {
      return withWrapper(() => client.request<GetFeedInfoByTokenQuery>(print(GetFeedInfoByTokenDocument), variables, requestHeaders));
    },
    me(variables?: MeQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MeQuery> {
      return withWrapper(() => client.request<MeQuery>(print(MeDocument), variables, requestHeaders));
    },
    meWithFeeds(variables?: MeWithFeedsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MeWithFeedsQuery> {
      return withWrapper(() => client.request<MeWithFeedsQuery>(print(MeWithFeedsDocument), variables, requestHeaders));
    },
    meWithOptions(variables?: MeWithOptionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MeWithOptionsQuery> {
      return withWrapper(() => client.request<MeWithOptionsQuery>(print(MeWithOptionsDocument), variables, requestHeaders));
    },
    myFeedItems(variables: MyFeedItemsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MyFeedItemsQuery> {
      return withWrapper(() => client.request<MyFeedItemsQuery>(print(MyFeedItemsDocument), variables, requestHeaders));
    },
    myFeeds(variables?: MyFeedsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MyFeedsQuery> {
      return withWrapper(() => client.request<MyFeedsQuery>(print(MyFeedsDocument), variables, requestHeaders));
    },
    myOptions(variables?: MyOptionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MyOptionsQuery> {
      return withWrapper(() => client.request<MyOptionsQuery>(print(MyOptionsDocument), variables, requestHeaders));
    },
    users(variables?: UsersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UsersQuery> {
      return withWrapper(() => client.request<UsersQuery>(print(UsersDocument), variables, requestHeaders));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;