import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

export type AddFeedEmailInput = {
  email: Scalars['String'];
  feedUrl: Scalars['String'];
};

export type AddFeedInput = {
  feedUrl: Scalars['String'];
};

export type ArgumentError = {
  __typename?: 'ArgumentError';
  argument?: Maybe<Scalars['String']>;
  message: Scalars['String'];
};

export type DeletedFeedResponse = {
  __typename?: 'DeletedFeedResponse';
  errors?: Maybe<Array<ArgumentError>>;
  ids?: Maybe<Array<Scalars['String']>>;
};

export enum DigestSchedule {
  Daily = 'daily',
  Disable = 'disable',
  Every2hours = 'every2hours',
  Every3hours = 'every3hours',
  Every6hours = 'every6hours',
  Every12hours = 'every12hours',
  Everyhour = 'everyhour',
  Realtime = 'realtime'
}

export type EmailPasswordInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type Enclosure = {
  __typename?: 'Enclosure';
  length?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  url: Scalars['String'];
};

export type Feed = {
  __typename?: 'Feed';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  favicon?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  imageTitle?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  lastPubdate?: Maybe<Scalars['DateTime']>;
  lastSuccessfulUpd: Scalars['DateTime'];
  link?: Maybe<Scalars['String']>;
  siteFavicon?: Maybe<Scalars['String']>;
  siteIcon?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  url: Scalars['String'];
  userFeeds?: Maybe<Array<UserFeed>>;
};

export type FeedImport = {
  schedule?: InputMaybe<DigestSchedule>;
  title?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};

export type FeedbackInput = {
  email: Scalars['String'];
  text: Scalars['String'];
};

export type FeedbackResponse = {
  __typename?: 'FeedbackResponse';
  errors?: Maybe<Array<ArgumentError>>;
  success?: Maybe<Scalars['Boolean']>;
};

export type ImportFeedsResponse = {
  __typename?: 'ImportFeedsResponse';
  errors?: Maybe<Array<ArgumentError>>;
  success?: Maybe<Scalars['Boolean']>;
};

export enum ImportState {
  Done = 'done',
  Importing = 'importing'
}

export type ImportStatusObject = {
  __typename?: 'ImportStatusObject';
  progress?: Maybe<Scalars['Float']>;
  result?: Maybe<Scalars['String']>;
  state?: Maybe<ImportState>;
  total?: Maybe<Scalars['Float']>;
};

export type Item = {
  __typename?: 'Item';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  enclosures?: Maybe<Array<Enclosure>>;
  feed: Feed;
  guid?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  imageUrl?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  pubdate?: Maybe<Scalars['DateTime']>;
  summary?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type MessageResponse = {
  __typename?: 'MessageResponse';
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateFeed: UserFeedResponse;
  addFeedToCurrentUser: UserFeedResponse;
  addFeedWithEmail?: Maybe<UserFeedResponse>;
  deleteMyFeeds: DeletedFeedResponse;
  deleteUser: MessageResponse;
  feedback?: Maybe<FeedbackResponse>;
  importFeeds: ImportFeedsResponse;
  login: UserResponse;
  logout: Scalars['Boolean'];
  register: UserResponse;
  requestEmailVerification: Scalars['Boolean'];
  requestPasswordReset: MessageResponse;
  resetPassword: UserResponse;
  setFeedActivated: UserFeedResponse;
  setFeedOptions: UserFeedResponse;
  setLastViewedItemDate?: Maybe<UserFeed>;
  setOptions: OptionsResponse;
  testFeedUpdate: Scalars['Boolean'];
  unsubscribeByToken: Scalars['Boolean'];
  updateUserInfo: User;
  verifyEmail: UserResponse;
};


export type MutationActivateFeedArgs = {
  token: Scalars['String'];
  userFeedId: Scalars['String'];
};


export type MutationAddFeedToCurrentUserArgs = {
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  input: AddFeedInput;
};


export type MutationAddFeedWithEmailArgs = {
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  input: AddFeedEmailInput;
  userInfo?: InputMaybe<UserInfoInput>;
};


export type MutationDeleteMyFeedsArgs = {
  ids: Array<Scalars['Float']>;
};


export type MutationFeedbackArgs = {
  input: FeedbackInput;
};


export type MutationImportFeedsArgs = {
  feeds: Array<FeedImport>;
};


export type MutationLoginArgs = {
  input: EmailPasswordInput;
};


export type MutationRegisterArgs = {
  input: EmailPasswordInput;
  userInfo?: InputMaybe<UserInfoInput>;
};


export type MutationRequestPasswordResetArgs = {
  email: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  input: PasswordResetInput;
};


export type MutationSetFeedActivatedArgs = {
  userFeedId: Scalars['Float'];
};


export type MutationSetFeedOptionsArgs = {
  id: Scalars['Float'];
  opts: UserFeedOptionsInput;
};


export type MutationSetLastViewedItemDateArgs = {
  itemId: Scalars['Float'];
  userFeedId: Scalars['Float'];
};


export type MutationSetOptionsArgs = {
  opts: OptionsInput;
};


export type MutationTestFeedUpdateArgs = {
  count: Scalars['Float'];
  feedId: Scalars['Float'];
};


export type MutationUnsubscribeByTokenArgs = {
  id: Scalars['String'];
  token: Scalars['String'];
};


export type MutationUpdateUserInfoArgs = {
  userInfo: UserInfoInput;
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String'];
  userId: Scalars['String'];
};

export type Options = {
  __typename?: 'Options';
  attachmentsDefault?: Maybe<Scalars['Boolean']>;
  customSubject?: Maybe<Scalars['String']>;
  dailyDigestHour: Scalars['Float'];
  itemBodyDefault: Scalars['Boolean'];
  shareEnable: Scalars['Boolean'];
  shareList?: Maybe<Array<ShareId>>;
  themeDefault: Theme;
  withContentTableDefault: Scalars['Boolean'];
};

export type OptionsInput = {
  attachmentsDefault?: InputMaybe<Scalars['Boolean']>;
  customSubject?: InputMaybe<Scalars['String']>;
  dailyDigestHour?: InputMaybe<Scalars['Float']>;
  itemBodyDefault?: InputMaybe<Scalars['Boolean']>;
  shareEnable?: InputMaybe<Scalars['Boolean']>;
  shareList?: InputMaybe<Array<Scalars['String']>>;
  themeDefault?: InputMaybe<Scalars['String']>;
  withContentTableDefault?: InputMaybe<Scalars['Boolean']>;
};

export type OptionsResponse = {
  __typename?: 'OptionsResponse';
  errors?: Maybe<Array<ArgumentError>>;
  options?: Maybe<Options>;
};

export type PaginatedItemsResponse = {
  __typename?: 'PaginatedItemsResponse';
  hasMore: Scalars['Boolean'];
  items: Array<Item>;
};

export type PasswordResetInput = {
  password: Scalars['String'];
  token: Scalars['String'];
  userId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  getFeedInfoByToken?: Maybe<UserFeed>;
  importStatus?: Maybe<ImportStatusObject>;
  me?: Maybe<User>;
  myFeedItems: PaginatedItemsResponse;
  myFeeds?: Maybe<Array<UserFeed>>;
  myOptions: Options;
  users?: Maybe<Array<User>>;
};


export type QueryGetFeedInfoByTokenArgs = {
  id: Scalars['String'];
  token: Scalars['String'];
};


export type QueryMyFeedItemsArgs = {
  feedId: Scalars['Float'];
  filter?: InputMaybe<Scalars['String']>;
  skip?: InputMaybe<Scalars['Float']>;
  take?: InputMaybe<Scalars['Float']>;
};

export enum ShareId {
  Evernote = 'evernote',
  Pocket = 'pocket',
  Trello = 'trello'
}

export type Subscription = {
  __typename?: 'Subscription';
  itemsCountUpdated: Array<UserFeedNewItemsCountResponse>;
};

export enum TernaryState {
  Default = 'default',
  Disable = 'disable',
  Enable = 'enable'
}

export enum Theme {
  Default = 'default',
  Text = 'text'
}

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  emailVerified: Scalars['Boolean'];
  feeds: Array<UserFeed>;
  id: Scalars['Float'];
  locale: Scalars['String'];
  options: Options;
  role: Scalars['String'];
  timeZone: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  userFeeds?: Maybe<Array<UserFeed>>;
};

export type UserFeed = {
  __typename?: 'UserFeed';
  activated: Scalars['Boolean'];
  attachments: TernaryState;
  createdAt: Scalars['DateTime'];
  feed: Feed;
  filter?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  itemBody: TernaryState;
  lastDigestSentAt?: Maybe<Scalars['DateTime']>;
  lastViewedItemDate?: Maybe<Scalars['DateTime']>;
  newItemsCount: Scalars['Float'];
  schedule: DigestSchedule;
  theme: Theme;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  user: User;
  withContentTable: TernaryState;
};

export type UserFeedNewItemsCountResponse = {
  __typename?: 'UserFeedNewItemsCountResponse';
  count: Scalars['Float'];
  feedId: Scalars['Float'];
};

export type UserFeedOptionsInput = {
  attachments?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  itemBody?: InputMaybe<Scalars['String']>;
  schedule?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  withContentTable?: InputMaybe<Scalars['String']>;
};

export type UserFeedResponse = {
  __typename?: 'UserFeedResponse';
  errors?: Maybe<Array<ArgumentError>>;
  userFeed?: Maybe<UserFeed>;
};

export type UserInfoInput = {
  locale?: InputMaybe<Scalars['String']>;
  timeZone?: InputMaybe<Scalars['String']>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<ArgumentError>>;
  user?: Maybe<User>;
};

export type FeedFieldsFragment = { __typename?: 'Feed', id: number, url: string, link?: string | null | undefined, title?: string | null | undefined, description?: string | null | undefined, language?: string | null | undefined, favicon?: string | null | undefined, imageUrl?: string | null | undefined, imageTitle?: string | null | undefined, lastSuccessfulUpd: any, lastPubdate?: any | null | undefined, createdAt: any, updatedAt: any };

export type ItemFieldsFragment = { __typename?: 'Item', id: number, guid?: string | null | undefined, pubdate?: any | null | undefined, link?: string | null | undefined, title?: string | null | undefined, description?: string | null | undefined, summary?: string | null | undefined, imageUrl?: string | null | undefined, createdAt: any, enclosures?: Array<{ __typename?: 'Enclosure', url: string, length?: string | null | undefined, type?: string | null | undefined }> | null | undefined };

export type OptionsFieldsFragment = { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault?: boolean | null | undefined, themeDefault: Theme, customSubject?: string | null | undefined, shareEnable: boolean, shareList?: Array<ShareId> | null | undefined };

export type UserFeedFieldsFragment = { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null | undefined, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null | undefined, lastViewedItemDate?: any | null | undefined, lastDigestSentAt?: any | null | undefined, newItemsCount: number, createdAt: any, updatedAt: any };

export type UserFieldsFragment = { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string };

export type UsualUserResponseFragment = { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null | undefined }> | null | undefined };

export type ActivateFeedMutationVariables = Exact<{
  token: Scalars['String'];
  userFeedId: Scalars['String'];
}>;


export type ActivateFeedMutation = { __typename?: 'Mutation', activateFeed: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null | undefined, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null | undefined, lastViewedItemDate?: any | null | undefined, lastDigestSentAt?: any | null | undefined, newItemsCount: number, createdAt: any, updatedAt: any, feed: { __typename?: 'Feed', id: number, url: string, title?: string | null | undefined } } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null | undefined } };

export type AddFeedToCurrentUserMutationVariables = Exact<{
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  input: AddFeedInput;
}>;


export type AddFeedToCurrentUserMutation = { __typename?: 'Mutation', addFeedToCurrentUser: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, feed: { __typename?: 'Feed', id: number, url: string } } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null | undefined }> | null | undefined } };

export type AddFeedWithEmailMutationVariables = Exact<{
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  userInfo?: InputMaybe<UserInfoInput>;
  input: AddFeedEmailInput;
}>;


export type AddFeedWithEmailMutation = { __typename?: 'Mutation', addFeedWithEmail?: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null | undefined, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null | undefined, lastViewedItemDate?: any | null | undefined, lastDigestSentAt?: any | null | undefined, newItemsCount: number, createdAt: any, updatedAt: any, feed: { __typename?: 'Feed', id: number, url: string, title?: string | null | undefined } } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null | undefined }> | null | undefined } | null | undefined };

export type DeleteMyFeedsMutationVariables = Exact<{
  ids: Array<Scalars['Float']> | Scalars['Float'];
}>;


export type DeleteMyFeedsMutation = { __typename?: 'Mutation', deleteMyFeeds: { __typename?: 'DeletedFeedResponse', ids?: Array<string> | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null | undefined } };

export type DeleteUserMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'MessageResponse', message: string } };

export type SendFeedbackMutationVariables = Exact<{
  input: FeedbackInput;
}>;


export type SendFeedbackMutation = { __typename?: 'Mutation', feedback?: { __typename?: 'FeedbackResponse', success?: boolean | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null | undefined } | null | undefined };

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null | undefined }> | null | undefined } };

export type RegisterMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null | undefined }> | null | undefined } };

export type RequestEmailVerificationMutationVariables = Exact<{ [key: string]: never; }>;


export type RequestEmailVerificationMutation = { __typename?: 'Mutation', requestEmailVerification: boolean };

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset: { __typename?: 'MessageResponse', message: string } };

export type ResetPasswordMutationVariables = Exact<{
  input: PasswordResetInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null | undefined } };

export type SetFeedOptionsMutationVariables = Exact<{
  id: Scalars['Float'];
  opts: UserFeedOptionsInput;
}>;


export type SetFeedOptionsMutation = { __typename?: 'Mutation', setFeedOptions: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null | undefined, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null | undefined, lastViewedItemDate?: any | null | undefined, lastDigestSentAt?: any | null | undefined, newItemsCount: number, createdAt: any, updatedAt: any } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null | undefined } };

export type SetLastViewedItemDateMutationVariables = Exact<{
  itemId: Scalars['Float'];
  userFeedId: Scalars['Float'];
}>;


export type SetLastViewedItemDateMutation = { __typename?: 'Mutation', setLastViewedItemDate?: { __typename?: 'UserFeed', id: number, lastViewedItemDate?: any | null | undefined, newItemsCount: number } | null | undefined };

export type SetOptionsMutationVariables = Exact<{
  opts: OptionsInput;
}>;


export type SetOptionsMutation = { __typename?: 'Mutation', setOptions: { __typename?: 'OptionsResponse', options?: { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault?: boolean | null | undefined, themeDefault: Theme, customSubject?: string | null | undefined, shareEnable: boolean, shareList?: Array<ShareId> | null | undefined } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null | undefined }> | null | undefined } };

export type UnsubscribeByTokenMutationVariables = Exact<{
  token: Scalars['String'];
  id: Scalars['String'];
}>;


export type UnsubscribeByTokenMutation = { __typename?: 'Mutation', unsubscribeByToken: boolean };

export type UpdateUserInfoMutationVariables = Exact<{
  userInfo: UserInfoInput;
}>;


export type UpdateUserInfoMutation = { __typename?: 'Mutation', updateUserInfo: { __typename?: 'User', timeZone: string, locale: string } };

export type VerifyEmailMutationVariables = Exact<{
  userId: Scalars['String'];
  token: Scalars['String'];
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, email: string, emailVerified: boolean } | null | undefined, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null | undefined } };

export type GetFeedInfoByTokenQueryVariables = Exact<{
  id: Scalars['String'];
  token: Scalars['String'];
}>;


export type GetFeedInfoByTokenQuery = { __typename?: 'Query', getFeedInfoByToken?: { __typename?: 'UserFeed', feed: { __typename?: 'Feed', title?: string | null | undefined, url: string } } | null | undefined };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null | undefined };

export type MeWithFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeWithFeedsQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string, feeds: Array<{ __typename?: 'UserFeed', activated: boolean, createdAt: any, feed: { __typename?: 'Feed', id: number, url: string, link?: string | null | undefined, title?: string | null | undefined, description?: string | null | undefined, language?: string | null | undefined, favicon?: string | null | undefined, imageUrl?: string | null | undefined, imageTitle?: string | null | undefined, lastSuccessfulUpd: any, lastPubdate?: any | null | undefined, createdAt: any, updatedAt: any } }> } | null | undefined };

export type MeWithOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeWithOptionsQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string, options: { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault?: boolean | null | undefined, themeDefault: Theme, customSubject?: string | null | undefined, shareEnable: boolean, shareList?: Array<ShareId> | null | undefined } } | null | undefined };

export type MyFeedItemsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Float']>;
  take?: InputMaybe<Scalars['Float']>;
  feedId: Scalars['Float'];
  filter?: InputMaybe<Scalars['String']>;
}>;


export type MyFeedItemsQuery = { __typename?: 'Query', myFeedItems: { __typename?: 'PaginatedItemsResponse', hasMore: boolean, items: Array<{ __typename?: 'Item', id: number, guid?: string | null | undefined, pubdate?: any | null | undefined, link?: string | null | undefined, title?: string | null | undefined, description?: string | null | undefined, summary?: string | null | undefined, imageUrl?: string | null | undefined, createdAt: any, enclosures?: Array<{ __typename?: 'Enclosure', url: string, length?: string | null | undefined, type?: string | null | undefined }> | null | undefined }> } };

export type MyFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFeedsQuery = { __typename?: 'Query', myFeeds?: Array<{ __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null | undefined, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null | undefined, lastViewedItemDate?: any | null | undefined, lastDigestSentAt?: any | null | undefined, newItemsCount: number, createdAt: any, updatedAt: any, feed: { __typename?: 'Feed', id: number, url: string, link?: string | null | undefined, title?: string | null | undefined, description?: string | null | undefined, language?: string | null | undefined, favicon?: string | null | undefined, imageUrl?: string | null | undefined, imageTitle?: string | null | undefined, lastSuccessfulUpd: any, lastPubdate?: any | null | undefined, createdAt: any, updatedAt: any } }> | null | undefined };

export type MyOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOptionsQuery = { __typename?: 'Query', myOptions: { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault?: boolean | null | undefined, themeDefault: Theme, customSubject?: string | null | undefined, shareEnable: boolean, shareList?: Array<ShareId> | null | undefined } };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users?: Array<{ __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string }> | null | undefined };

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
export const DeleteUserDocument = gql`
    mutation deleteUser {
  deleteUser {
    message
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

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    activateFeed(variables: ActivateFeedMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ActivateFeedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ActivateFeedMutation>(ActivateFeedDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'activateFeed');
    },
    addFeedToCurrentUser(variables: AddFeedToCurrentUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddFeedToCurrentUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddFeedToCurrentUserMutation>(AddFeedToCurrentUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addFeedToCurrentUser');
    },
    addFeedWithEmail(variables: AddFeedWithEmailMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddFeedWithEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddFeedWithEmailMutation>(AddFeedWithEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addFeedWithEmail');
    },
    deleteMyFeeds(variables: DeleteMyFeedsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteMyFeedsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteMyFeedsMutation>(DeleteMyFeedsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteMyFeeds');
    },
    deleteUser(variables?: DeleteUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DeleteUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteUserMutation>(DeleteUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteUser');
    },
    sendFeedback(variables: SendFeedbackMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SendFeedbackMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SendFeedbackMutation>(SendFeedbackDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'sendFeedback');
    },
    login(variables: LoginMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LoginMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LoginMutation>(LoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'login');
    },
    register(variables: RegisterMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RegisterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterMutation>(RegisterDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'register');
    },
    requestEmailVerification(variables?: RequestEmailVerificationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RequestEmailVerificationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestEmailVerificationMutation>(RequestEmailVerificationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'requestEmailVerification');
    },
    requestPasswordReset(variables: RequestPasswordResetMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RequestPasswordResetMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestPasswordResetMutation>(RequestPasswordResetDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'requestPasswordReset');
    },
    resetPassword(variables: ResetPasswordMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ResetPasswordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResetPasswordMutation>(ResetPasswordDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'resetPassword');
    },
    setFeedOptions(variables: SetFeedOptionsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetFeedOptionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetFeedOptionsMutation>(SetFeedOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setFeedOptions');
    },
    setLastViewedItemDate(variables: SetLastViewedItemDateMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetLastViewedItemDateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetLastViewedItemDateMutation>(SetLastViewedItemDateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setLastViewedItemDate');
    },
    setOptions(variables: SetOptionsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetOptionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetOptionsMutation>(SetOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setOptions');
    },
    unsubscribeByToken(variables: UnsubscribeByTokenMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UnsubscribeByTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnsubscribeByTokenMutation>(UnsubscribeByTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'unsubscribeByToken');
    },
    updateUserInfo(variables: UpdateUserInfoMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateUserInfoMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserInfoMutation>(UpdateUserInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateUserInfo');
    },
    verifyEmail(variables: VerifyEmailMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<VerifyEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VerifyEmailMutation>(VerifyEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'verifyEmail');
    },
    getFeedInfoByToken(variables: GetFeedInfoByTokenQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetFeedInfoByTokenQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetFeedInfoByTokenQuery>(GetFeedInfoByTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getFeedInfoByToken');
    },
    me(variables?: MeQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeQuery>(MeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'me');
    },
    meWithFeeds(variables?: MeWithFeedsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MeWithFeedsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeWithFeedsQuery>(MeWithFeedsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'meWithFeeds');
    },
    meWithOptions(variables?: MeWithOptionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MeWithOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeWithOptionsQuery>(MeWithOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'meWithOptions');
    },
    myFeedItems(variables: MyFeedItemsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MyFeedItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyFeedItemsQuery>(MyFeedItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myFeedItems');
    },
    myFeeds(variables?: MyFeedsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MyFeedsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyFeedsQuery>(MyFeedsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myFeeds');
    },
    myOptions(variables?: MyOptionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<MyOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyOptionsQuery>(MyOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myOptions');
    },
    users(variables?: UsersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UsersQuery>(UsersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'users');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;