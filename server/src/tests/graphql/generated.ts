import { GraphQLClient, RequestOptions } from 'graphql-request';
import { gql } from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeFix: { input: any; output: any; }
};

export type AddFeedEmailInput = {
  email: Scalars['String']['input'];
  feedUrl: Scalars['String']['input'];
};

export type AddFeedInput = {
  feedUrl: Scalars['String']['input'];
};

export type ArgumentError = {
  __typename?: 'ArgumentError';
  argument?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type DeletedFeedResponse = {
  __typename?: 'DeletedFeedResponse';
  errors?: Maybe<Array<ArgumentError>>;
  ids?: Maybe<Array<Scalars['String']['output']>>;
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
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Enclosure = {
  __typename?: 'Enclosure';
  length?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type Feed = {
  __typename?: 'Feed';
  createdAt: Scalars['DateTimeFix']['output'];
  description?: Maybe<Scalars['String']['output']>;
  favicon?: Maybe<Scalars['String']['output']>;
  id: Scalars['Float']['output'];
  imageTitle?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  lastPubdate?: Maybe<Scalars['DateTimeFix']['output']>;
  lastSuccessfulUpd: Scalars['DateTimeFix']['output'];
  link?: Maybe<Scalars['String']['output']>;
  siteFavicon?: Maybe<Scalars['String']['output']>;
  siteIcon?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTimeFix']['output'];
  url: Scalars['String']['output'];
  userFeeds?: Maybe<Array<UserFeed>>;
};

export type FeedImport = {
  schedule?: InputMaybe<DigestSchedule>;
  title?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type FeedbackInput = {
  email: Scalars['String']['input'];
  text: Scalars['String']['input'];
};

export type FeedbackResponse = {
  __typename?: 'FeedbackResponse';
  errors?: Maybe<Array<ArgumentError>>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type ImportFeedsResponse = {
  __typename?: 'ImportFeedsResponse';
  errors?: Maybe<Array<ArgumentError>>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

export enum ImportState {
  Done = 'done',
  Importing = 'importing'
}

export type ImportStatusObject = {
  __typename?: 'ImportStatusObject';
  progress?: Maybe<Scalars['Float']['output']>;
  result?: Maybe<Scalars['String']['output']>;
  state?: Maybe<ImportState>;
  total?: Maybe<Scalars['Float']['output']>;
};

export type Item = {
  __typename?: 'Item';
  createdAt: Scalars['DateTimeFix']['output'];
  description?: Maybe<Scalars['String']['output']>;
  enclosures?: Maybe<Array<Enclosure>>;
  feed: Feed;
  guid?: Maybe<Scalars['String']['output']>;
  id: Scalars['Float']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  pubdate?: Maybe<Scalars['DateTimeFix']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type MessageResponse = {
  __typename?: 'MessageResponse';
  message: Scalars['String']['output'];
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
  logout: Scalars['Boolean']['output'];
  register: UserResponse;
  requestEmailVerification: Scalars['Boolean']['output'];
  requestPasswordReset: MessageResponse;
  resetPassword: UserResponse;
  setFeedActivated: UserFeedResponse;
  setFeedOptions: UserFeedResponse;
  setLastViewedItemDate?: Maybe<UserFeed>;
  setOptions: OptionsResponse;
  testFeedUpdate: Scalars['Boolean']['output'];
  unsubscribeByToken: Scalars['Boolean']['output'];
  updateUserInfo: User;
  verifyEmail: UserResponse;
};


export type MutationActivateFeedArgs = {
  token: Scalars['String']['input'];
  userFeedId: Scalars['String']['input'];
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
  ids: Array<Scalars['Float']['input']>;
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
  email: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  input: PasswordResetInput;
};


export type MutationSetFeedActivatedArgs = {
  userFeedId: Scalars['Float']['input'];
};


export type MutationSetFeedOptionsArgs = {
  id: Scalars['Float']['input'];
  opts: UserFeedOptionsInput;
};


export type MutationSetLastViewedItemDateArgs = {
  itemId: Scalars['Float']['input'];
  userFeedId: Scalars['Float']['input'];
};


export type MutationSetOptionsArgs = {
  opts: OptionsInput;
};


export type MutationTestFeedUpdateArgs = {
  count: Scalars['Float']['input'];
  feedId: Scalars['Float']['input'];
};


export type MutationUnsubscribeByTokenArgs = {
  id: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationUpdateUserInfoArgs = {
  userInfo: UserInfoInput;
};


export type MutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type Options = {
  __typename?: 'Options';
  attachmentsDefault: Scalars['Boolean']['output'];
  customSubject?: Maybe<Scalars['String']['output']>;
  dailyDigestHour: Scalars['Float']['output'];
  itemBodyDefault: Scalars['Boolean']['output'];
  shareEnable: Scalars['Boolean']['output'];
  shareList?: Maybe<Array<ShareId>>;
  themeDefault: Theme;
  withContentTableDefault: Scalars['Boolean']['output'];
};

export type OptionsInput = {
  attachmentsDefault?: InputMaybe<Scalars['Boolean']['input']>;
  customSubject?: InputMaybe<Scalars['String']['input']>;
  dailyDigestHour?: InputMaybe<Scalars['Float']['input']>;
  itemBodyDefault?: InputMaybe<Scalars['Boolean']['input']>;
  shareEnable?: InputMaybe<Scalars['Boolean']['input']>;
  shareList?: InputMaybe<Array<Scalars['String']['input']>>;
  themeDefault?: InputMaybe<Scalars['String']['input']>;
  withContentTableDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OptionsResponse = {
  __typename?: 'OptionsResponse';
  errors?: Maybe<Array<ArgumentError>>;
  options?: Maybe<Options>;
};

export type PaginatedItemsResponse = {
  __typename?: 'PaginatedItemsResponse';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Item>;
};

export type PasswordResetInput = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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
  id: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type QueryMyFeedItemsArgs = {
  feedId: Scalars['Float']['input'];
  filter?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Float']['input']>;
  take?: InputMaybe<Scalars['Float']['input']>;
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
  createdAt: Scalars['DateTimeFix']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  feeds: Array<UserFeed>;
  id: Scalars['Float']['output'];
  locale: Scalars['String']['output'];
  options: Options;
  role: Scalars['String']['output'];
  timeZone: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeFix']['output'];
  userFeeds?: Maybe<Array<UserFeed>>;
};

export type UserFeed = {
  __typename?: 'UserFeed';
  activated: Scalars['Boolean']['output'];
  attachments: TernaryState;
  createdAt: Scalars['DateTimeFix']['output'];
  feed: Feed;
  filter?: Maybe<Scalars['String']['output']>;
  id: Scalars['Float']['output'];
  itemBody: TernaryState;
  lastDigestSentAt?: Maybe<Scalars['DateTimeFix']['output']>;
  lastViewedItemDate?: Maybe<Scalars['DateTimeFix']['output']>;
  newItemsCount: Scalars['Float']['output'];
  schedule: DigestSchedule;
  theme: Theme;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTimeFix']['output'];
  user: User;
  withContentTable: TernaryState;
};

export type UserFeedNewItemsCountResponse = {
  __typename?: 'UserFeedNewItemsCountResponse';
  count: Scalars['Float']['output'];
  feedId: Scalars['Float']['output'];
};

export type UserFeedOptionsInput = {
  attachments?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  itemBody?: InputMaybe<Scalars['String']['input']>;
  schedule?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  withContentTable?: InputMaybe<Scalars['String']['input']>;
};

export type UserFeedResponse = {
  __typename?: 'UserFeedResponse';
  errors?: Maybe<Array<ArgumentError>>;
  userFeed?: Maybe<UserFeed>;
};

export type UserInfoInput = {
  locale?: InputMaybe<Scalars['String']['input']>;
  timeZone?: InputMaybe<Scalars['String']['input']>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<ArgumentError>>;
  user?: Maybe<User>;
};

export type FeedFieldsFragment = { __typename?: 'Feed', id: number, url: string, link?: string | null, title?: string | null, description?: string | null, language?: string | null, favicon?: string | null, imageUrl?: string | null, imageTitle?: string | null, lastSuccessfulUpd: any, lastPubdate?: any | null, createdAt: any, updatedAt: any };

export type ItemFieldsFragment = { __typename?: 'Item', id: number, guid?: string | null, pubdate?: any | null, link?: string | null, title?: string | null, description?: string | null, summary?: string | null, imageUrl?: string | null, createdAt: any, enclosures?: Array<{ __typename?: 'Enclosure', url: string, length?: string | null, type?: string | null }> | null };

export type OptionsFieldsFragment = { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault: boolean, themeDefault: Theme, customSubject?: string | null, shareEnable: boolean, shareList?: Array<ShareId> | null };

export type UserFeedFieldsFragment = { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null, lastViewedItemDate?: any | null, lastDigestSentAt?: any | null, newItemsCount: number, createdAt: any, updatedAt: any };

export type UserFieldsFragment = { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string };

export type UsualUserResponseFragment = { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null }> | null };

export type ActivateFeedMutationVariables = Exact<{
  token: Scalars['String']['input'];
  userFeedId: Scalars['String']['input'];
}>;


export type ActivateFeedMutation = { __typename?: 'Mutation', activateFeed: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null, lastViewedItemDate?: any | null, lastDigestSentAt?: any | null, newItemsCount: number, createdAt: any, updatedAt: any, feed: { __typename?: 'Feed', id: number, url: string, title?: string | null } } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null } };

export type AddFeedToCurrentUserMutationVariables = Exact<{
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  input: AddFeedInput;
}>;


export type AddFeedToCurrentUserMutation = { __typename?: 'Mutation', addFeedToCurrentUser: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, feed: { __typename?: 'Feed', id: number, url: string } } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null }> | null } };

export type AddFeedWithEmailMutationVariables = Exact<{
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  userInfo?: InputMaybe<UserInfoInput>;
  input: AddFeedEmailInput;
}>;


export type AddFeedWithEmailMutation = { __typename?: 'Mutation', addFeedWithEmail?: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null, lastViewedItemDate?: any | null, lastDigestSentAt?: any | null, newItemsCount: number, createdAt: any, updatedAt: any, feed: { __typename?: 'Feed', id: number, url: string, title?: string | null } } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null }> | null } | null };

export type DeleteMyFeedsMutationVariables = Exact<{
  ids: Array<Scalars['Float']['input']> | Scalars['Float']['input'];
}>;


export type DeleteMyFeedsMutation = { __typename?: 'Mutation', deleteMyFeeds: { __typename?: 'DeletedFeedResponse', ids?: Array<string> | null, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null } };

export type DeleteUserMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'MessageResponse', message: string } };

export type SendFeedbackMutationVariables = Exact<{
  input: FeedbackInput;
}>;


export type SendFeedbackMutation = { __typename?: 'Mutation', feedback?: { __typename?: 'FeedbackResponse', success?: boolean | null, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null }> | null } };

export type RegisterMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null }> | null } };

export type RequestEmailVerificationMutationVariables = Exact<{ [key: string]: never; }>;


export type RequestEmailVerificationMutation = { __typename?: 'Mutation', requestEmailVerification: boolean };

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset: { __typename?: 'MessageResponse', message: string } };

export type ResetPasswordMutationVariables = Exact<{
  input: PasswordResetInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null } };

export type SetFeedOptionsMutationVariables = Exact<{
  id: Scalars['Float']['input'];
  opts: UserFeedOptionsInput;
}>;


export type SetFeedOptionsMutation = { __typename?: 'Mutation', setFeedOptions: { __typename?: 'UserFeedResponse', userFeed?: { __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null, lastViewedItemDate?: any | null, lastDigestSentAt?: any | null, newItemsCount: number, createdAt: any, updatedAt: any } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null } };

export type SetLastViewedItemDateMutationVariables = Exact<{
  itemId: Scalars['Float']['input'];
  userFeedId: Scalars['Float']['input'];
}>;


export type SetLastViewedItemDateMutation = { __typename?: 'Mutation', setLastViewedItemDate?: { __typename?: 'UserFeed', id: number, lastViewedItemDate?: any | null, newItemsCount: number } | null };

export type SetOptionsMutationVariables = Exact<{
  opts: OptionsInput;
}>;


export type SetOptionsMutation = { __typename?: 'Mutation', setOptions: { __typename?: 'OptionsResponse', options?: { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault: boolean, themeDefault: Theme, customSubject?: string | null, shareEnable: boolean, shareList?: Array<ShareId> | null } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string, argument?: string | null }> | null } };

export type UnsubscribeByTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
  id: Scalars['String']['input'];
}>;


export type UnsubscribeByTokenMutation = { __typename?: 'Mutation', unsubscribeByToken: boolean };

export type UpdateUserInfoMutationVariables = Exact<{
  userInfo: UserInfoInput;
}>;


export type UpdateUserInfoMutation = { __typename?: 'Mutation', updateUserInfo: { __typename?: 'User', timeZone: string, locale: string } };

export type VerifyEmailMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  token: Scalars['String']['input'];
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail: { __typename?: 'UserResponse', user?: { __typename?: 'User', id: number, email: string, emailVerified: boolean } | null, errors?: Array<{ __typename?: 'ArgumentError', message: string }> | null } };

export type GetFeedInfoByTokenQueryVariables = Exact<{
  id: Scalars['String']['input'];
  token: Scalars['String']['input'];
}>;


export type GetFeedInfoByTokenQuery = { __typename?: 'Query', getFeedInfoByToken?: { __typename?: 'UserFeed', feed: { __typename?: 'Feed', title?: string | null, url: string } } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string } | null };

export type MeWithFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeWithFeedsQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string, feeds: Array<{ __typename?: 'UserFeed', activated: boolean, createdAt: any, feed: { __typename?: 'Feed', id: number, url: string, link?: string | null, title?: string | null, description?: string | null, language?: string | null, favicon?: string | null, imageUrl?: string | null, imageTitle?: string | null, lastSuccessfulUpd: any, lastPubdate?: any | null, createdAt: any, updatedAt: any } }> } | null };

export type MeWithOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeWithOptionsQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string, options: { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault: boolean, themeDefault: Theme, customSubject?: string | null, shareEnable: boolean, shareList?: Array<ShareId> | null } } | null };

export type MyFeedItemsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Float']['input']>;
  take?: InputMaybe<Scalars['Float']['input']>;
  feedId: Scalars['Float']['input'];
  filter?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyFeedItemsQuery = { __typename?: 'Query', myFeedItems: { __typename?: 'PaginatedItemsResponse', hasMore: boolean, items: Array<{ __typename?: 'Item', id: number, guid?: string | null, pubdate?: any | null, link?: string | null, title?: string | null, description?: string | null, summary?: string | null, imageUrl?: string | null, createdAt: any, enclosures?: Array<{ __typename?: 'Enclosure', url: string, length?: string | null, type?: string | null }> | null }> } };

export type MyFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFeedsQuery = { __typename?: 'Query', myFeeds?: Array<{ __typename?: 'UserFeed', id: number, activated: boolean, title?: string | null, schedule: DigestSchedule, withContentTable: TernaryState, itemBody: TernaryState, attachments: TernaryState, theme: Theme, filter?: string | null, lastViewedItemDate?: any | null, lastDigestSentAt?: any | null, newItemsCount: number, createdAt: any, updatedAt: any, feed: { __typename?: 'Feed', id: number, url: string, link?: string | null, title?: string | null, description?: string | null, language?: string | null, favicon?: string | null, imageUrl?: string | null, imageTitle?: string | null, lastSuccessfulUpd: any, lastPubdate?: any | null, createdAt: any, updatedAt: any } }> | null };

export type MyOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOptionsQuery = { __typename?: 'Query', myOptions: { __typename?: 'Options', dailyDigestHour: number, withContentTableDefault: boolean, itemBodyDefault: boolean, attachmentsDefault: boolean, themeDefault: Theme, customSubject?: string | null, shareEnable: boolean, shareList?: Array<ShareId> | null } };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users?: Array<{ __typename?: 'User', id: number, role: string, email: string, emailVerified: boolean, locale: string, timeZone: string }> | null };

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

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    activateFeed(variables: ActivateFeedMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ActivateFeedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ActivateFeedMutation>(ActivateFeedDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'activateFeed', 'mutation', variables);
    },
    addFeedToCurrentUser(variables: AddFeedToCurrentUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddFeedToCurrentUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddFeedToCurrentUserMutation>(AddFeedToCurrentUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addFeedToCurrentUser', 'mutation', variables);
    },
    addFeedWithEmail(variables: AddFeedWithEmailMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddFeedWithEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddFeedWithEmailMutation>(AddFeedWithEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addFeedWithEmail', 'mutation', variables);
    },
    deleteMyFeeds(variables: DeleteMyFeedsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteMyFeedsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteMyFeedsMutation>(DeleteMyFeedsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteMyFeeds', 'mutation', variables);
    },
    deleteUser(variables?: DeleteUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteUserMutation>(DeleteUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteUser', 'mutation', variables);
    },
    sendFeedback(variables: SendFeedbackMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SendFeedbackMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SendFeedbackMutation>(SendFeedbackDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'sendFeedback', 'mutation', variables);
    },
    login(variables: LoginMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<LoginMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LoginMutation>(LoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'login', 'mutation', variables);
    },
    register(variables: RegisterMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RegisterMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterMutation>(RegisterDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'register', 'mutation', variables);
    },
    requestEmailVerification(variables?: RequestEmailVerificationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RequestEmailVerificationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestEmailVerificationMutation>(RequestEmailVerificationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'requestEmailVerification', 'mutation', variables);
    },
    requestPasswordReset(variables: RequestPasswordResetMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RequestPasswordResetMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestPasswordResetMutation>(RequestPasswordResetDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'requestPasswordReset', 'mutation', variables);
    },
    resetPassword(variables: ResetPasswordMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ResetPasswordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResetPasswordMutation>(ResetPasswordDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'resetPassword', 'mutation', variables);
    },
    setFeedOptions(variables: SetFeedOptionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetFeedOptionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetFeedOptionsMutation>(SetFeedOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setFeedOptions', 'mutation', variables);
    },
    setLastViewedItemDate(variables: SetLastViewedItemDateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetLastViewedItemDateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetLastViewedItemDateMutation>(SetLastViewedItemDateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setLastViewedItemDate', 'mutation', variables);
    },
    setOptions(variables: SetOptionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetOptionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetOptionsMutation>(SetOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setOptions', 'mutation', variables);
    },
    unsubscribeByToken(variables: UnsubscribeByTokenMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UnsubscribeByTokenMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnsubscribeByTokenMutation>(UnsubscribeByTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'unsubscribeByToken', 'mutation', variables);
    },
    updateUserInfo(variables: UpdateUserInfoMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateUserInfoMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserInfoMutation>(UpdateUserInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateUserInfo', 'mutation', variables);
    },
    verifyEmail(variables: VerifyEmailMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<VerifyEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VerifyEmailMutation>(VerifyEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'verifyEmail', 'mutation', variables);
    },
    getFeedInfoByToken(variables: GetFeedInfoByTokenQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetFeedInfoByTokenQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetFeedInfoByTokenQuery>(GetFeedInfoByTokenDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getFeedInfoByToken', 'query', variables);
    },
    me(variables?: MeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeQuery>(MeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'me', 'query', variables);
    },
    meWithFeeds(variables?: MeWithFeedsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeWithFeedsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeWithFeedsQuery>(MeWithFeedsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'meWithFeeds', 'query', variables);
    },
    meWithOptions(variables?: MeWithOptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeWithOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeWithOptionsQuery>(MeWithOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'meWithOptions', 'query', variables);
    },
    myFeedItems(variables: MyFeedItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MyFeedItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyFeedItemsQuery>(MyFeedItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myFeedItems', 'query', variables);
    },
    myFeeds(variables?: MyFeedsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MyFeedsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyFeedsQuery>(MyFeedsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myFeeds', 'query', variables);
    },
    myOptions(variables?: MyOptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MyOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyOptionsQuery>(MyOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myOptions', 'query', variables);
    },
    users(variables?: UsersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UsersQuery>(UsersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'users', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;