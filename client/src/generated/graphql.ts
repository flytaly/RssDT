import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {};
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
  Realtime = 'realtime',
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
  Importing = 'importing',
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
  Trello = 'trello',
}

export type Subscription = {
  __typename?: 'Subscription';
  itemsCountUpdated: Array<UserFeedNewItemsCountResponse>;
};

export enum TernaryState {
  Default = 'default',
  Disable = 'disable',
  Enable = 'enable',
}

export enum Theme {
  Default = 'default',
  Text = 'text',
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

export type FeedFieldsFragment = {
  __typename?: 'Feed';
  id: number;
  url: string;
  link?: string | null | undefined;
  title?: string | null | undefined;
  description?: string | null | undefined;
  language?: string | null | undefined;
  favicon?: string | null | undefined;
  siteIcon?: string | null | undefined;
  siteFavicon?: string | null | undefined;
  imageUrl?: string | null | undefined;
  imageTitle?: string | null | undefined;
  lastSuccessfulUpd: any;
  lastPubdate?: any | null | undefined;
  createdAt: any;
  updatedAt: any;
};

export type ItemFieldsFragment = {
  __typename?: 'Item';
  id: number;
  guid?: string | null | undefined;
  pubdate?: any | null | undefined;
  link?: string | null | undefined;
  title?: string | null | undefined;
  description?: string | null | undefined;
  summary?: string | null | undefined;
  imageUrl?: string | null | undefined;
  createdAt: any;
  enclosures?:
    | Array<{
        __typename?: 'Enclosure';
        url: string;
        length?: string | null | undefined;
        type?: string | null | undefined;
      }>
    | null
    | undefined;
};

export type OptionsFieldsFragment = {
  __typename?: 'Options';
  dailyDigestHour: number;
  withContentTableDefault: boolean;
  itemBodyDefault: boolean;
  attachmentsDefault?: boolean | null | undefined;
  themeDefault: Theme;
  customSubject?: string | null | undefined;
  shareEnable: boolean;
  shareList?: Array<ShareId> | null | undefined;
};

export type UserFeedFieldsFragment = {
  __typename?: 'UserFeed';
  id: number;
  activated: boolean;
  title?: string | null | undefined;
  schedule: DigestSchedule;
  withContentTable: TernaryState;
  itemBody: TernaryState;
  attachments: TernaryState;
  theme: Theme;
  filter?: string | null | undefined;
  createdAt: any;
  lastDigestSentAt?: any | null | undefined;
  newItemsCount: number;
  lastViewedItemDate?: any | null | undefined;
};

export type UserFieldsFragment = {
  __typename?: 'User';
  id: number;
  role: string;
  email: string;
  emailVerified: boolean;
  locale: string;
  timeZone: string;
};

export type UsualUserResponseFragment = {
  __typename?: 'UserResponse';
  user?:
    | {
        __typename?: 'User';
        id: number;
        role: string;
        email: string;
        emailVerified: boolean;
        locale: string;
        timeZone: string;
      }
    | null
    | undefined;
  errors?:
    | Array<{ __typename?: 'ArgumentError'; message: string; argument?: string | null | undefined }>
    | null
    | undefined;
};

export type ActivateFeedMutationVariables = Exact<{
  token: Scalars['String'];
  userFeedId: Scalars['String'];
}>;

export type ActivateFeedMutation = {
  __typename?: 'Mutation';
  activateFeed: {
    __typename?: 'UserFeedResponse';
    userFeed?:
      | {
          __typename?: 'UserFeed';
          id: number;
          activated: boolean;
          title?: string | null | undefined;
          schedule: DigestSchedule;
          withContentTable: TernaryState;
          itemBody: TernaryState;
          attachments: TernaryState;
          theme: Theme;
          filter?: string | null | undefined;
          createdAt: any;
          lastDigestSentAt?: any | null | undefined;
          newItemsCount: number;
          lastViewedItemDate?: any | null | undefined;
          feed: { __typename?: 'Feed'; id: number; url: string; title?: string | null | undefined };
        }
      | null
      | undefined;
    errors?:
      | Array<{
          __typename?: 'ArgumentError';
          message: string;
          argument?: string | null | undefined;
        }>
      | null
      | undefined;
  };
};

export type AddFeedToCurrentUserMutationVariables = Exact<{
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  input: AddFeedInput;
}>;

export type AddFeedToCurrentUserMutation = {
  __typename?: 'Mutation';
  addFeedToCurrentUser: {
    __typename?: 'UserFeedResponse';
    userFeed?:
      | {
          __typename?: 'UserFeed';
          id: number;
          activated: boolean;
          title?: string | null | undefined;
          schedule: DigestSchedule;
          withContentTable: TernaryState;
          itemBody: TernaryState;
          attachments: TernaryState;
          theme: Theme;
          filter?: string | null | undefined;
          createdAt: any;
          lastDigestSentAt?: any | null | undefined;
          newItemsCount: number;
          lastViewedItemDate?: any | null | undefined;
          feed: {
            __typename?: 'Feed';
            id: number;
            url: string;
            link?: string | null | undefined;
            title?: string | null | undefined;
            description?: string | null | undefined;
            language?: string | null | undefined;
            favicon?: string | null | undefined;
            siteIcon?: string | null | undefined;
            siteFavicon?: string | null | undefined;
            imageUrl?: string | null | undefined;
            imageTitle?: string | null | undefined;
            lastSuccessfulUpd: any;
            lastPubdate?: any | null | undefined;
            createdAt: any;
            updatedAt: any;
          };
        }
      | null
      | undefined;
    errors?:
      | Array<{
          __typename?: 'ArgumentError';
          message: string;
          argument?: string | null | undefined;
        }>
      | null
      | undefined;
  };
};

export type AddFeedWithEmailMutationVariables = Exact<{
  feedOpts?: InputMaybe<UserFeedOptionsInput>;
  userInfo?: InputMaybe<UserInfoInput>;
  input: AddFeedEmailInput;
}>;

export type AddFeedWithEmailMutation = {
  __typename?: 'Mutation';
  addFeedWithEmail?:
    | {
        __typename?: 'UserFeedResponse';
        userFeed?:
          | {
              __typename?: 'UserFeed';
              id: number;
              activated: boolean;
              title?: string | null | undefined;
              schedule: DigestSchedule;
              withContentTable: TernaryState;
              itemBody: TernaryState;
              attachments: TernaryState;
              theme: Theme;
              filter?: string | null | undefined;
              createdAt: any;
              lastDigestSentAt?: any | null | undefined;
              newItemsCount: number;
              lastViewedItemDate?: any | null | undefined;
              feed: {
                __typename?: 'Feed';
                id: number;
                url: string;
                title?: string | null | undefined;
              };
            }
          | null
          | undefined;
        errors?:
          | Array<{
              __typename?: 'ArgumentError';
              message: string;
              argument?: string | null | undefined;
            }>
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type DeleteMeMutationVariables = Exact<{ [key: string]: never }>;

export type DeleteMeMutation = {
  __typename?: 'Mutation';
  deleteUser: { __typename?: 'MessageResponse'; message: string };
};

export type DeleteMyFeedsMutationVariables = Exact<{
  ids: Array<Scalars['Float']> | Scalars['Float'];
}>;

export type DeleteMyFeedsMutation = {
  __typename?: 'Mutation';
  deleteMyFeeds: {
    __typename?: 'DeletedFeedResponse';
    ids?: Array<string> | null | undefined;
    errors?: Array<{ __typename?: 'ArgumentError'; message: string }> | null | undefined;
  };
};

export type ImportFeedsMutationVariables = Exact<{
  feedImport: Array<FeedImport> | FeedImport;
}>;

export type ImportFeedsMutation = {
  __typename?: 'Mutation';
  importFeeds: {
    __typename?: 'ImportFeedsResponse';
    success?: boolean | null | undefined;
    errors?: Array<{ __typename?: 'ArgumentError'; message: string }> | null | undefined;
  };
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: {
    __typename?: 'UserResponse';
    user?:
      | {
          __typename?: 'User';
          id: number;
          role: string;
          email: string;
          emailVerified: boolean;
          locale: string;
          timeZone: string;
        }
      | null
      | undefined;
    errors?:
      | Array<{
          __typename?: 'ArgumentError';
          message: string;
          argument?: string | null | undefined;
        }>
      | null
      | undefined;
  };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: 'Mutation'; logout: boolean };

export type RegisterMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;

export type RegisterMutation = {
  __typename?: 'Mutation';
  register: {
    __typename?: 'UserResponse';
    user?:
      | {
          __typename?: 'User';
          id: number;
          role: string;
          email: string;
          emailVerified: boolean;
          locale: string;
          timeZone: string;
        }
      | null
      | undefined;
    errors?:
      | Array<{
          __typename?: 'ArgumentError';
          message: string;
          argument?: string | null | undefined;
        }>
      | null
      | undefined;
  };
};

export type RequestEmailVerificationMutationVariables = Exact<{ [key: string]: never }>;

export type RequestEmailVerificationMutation = {
  __typename?: 'Mutation';
  requestEmailVerification: boolean;
};

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String'];
}>;

export type RequestPasswordResetMutation = {
  __typename?: 'Mutation';
  requestPasswordReset: { __typename?: 'MessageResponse'; message: string };
};

export type ResetPasswordMutationVariables = Exact<{
  input: PasswordResetInput;
}>;

export type ResetPasswordMutation = {
  __typename?: 'Mutation';
  resetPassword: {
    __typename?: 'UserResponse';
    user?:
      | {
          __typename?: 'User';
          id: number;
          role: string;
          email: string;
          emailVerified: boolean;
          locale: string;
          timeZone: string;
        }
      | null
      | undefined;
    errors?:
      | Array<{
          __typename?: 'ArgumentError';
          message: string;
          argument?: string | null | undefined;
        }>
      | null
      | undefined;
  };
};

export type SendFeedbackMutationVariables = Exact<{
  input: FeedbackInput;
}>;

export type SendFeedbackMutation = {
  __typename?: 'Mutation';
  feedback?:
    | {
        __typename?: 'FeedbackResponse';
        success?: boolean | null | undefined;
        errors?:
          | Array<{
              __typename?: 'ArgumentError';
              argument?: string | null | undefined;
              message: string;
            }>
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type SetFeedOptionsMutationVariables = Exact<{
  id: Scalars['Float'];
  opts: UserFeedOptionsInput;
}>;

export type SetFeedOptionsMutation = {
  __typename?: 'Mutation';
  setFeedOptions: {
    __typename?: 'UserFeedResponse';
    userFeed?:
      | {
          __typename?: 'UserFeed';
          id: number;
          activated: boolean;
          title?: string | null | undefined;
          schedule: DigestSchedule;
          withContentTable: TernaryState;
          itemBody: TernaryState;
          attachments: TernaryState;
          theme: Theme;
          filter?: string | null | undefined;
          createdAt: any;
          lastDigestSentAt?: any | null | undefined;
          newItemsCount: number;
          lastViewedItemDate?: any | null | undefined;
        }
      | null
      | undefined;
    errors?: Array<{ __typename?: 'ArgumentError'; message: string }> | null | undefined;
  };
};

export type SetLastViewedItemDateMutationVariables = Exact<{
  itemId: Scalars['Float'];
  userFeedId: Scalars['Float'];
}>;

export type SetLastViewedItemDateMutation = {
  __typename?: 'Mutation';
  setLastViewedItemDate?:
    | {
        __typename?: 'UserFeed';
        id: number;
        lastViewedItemDate?: any | null | undefined;
        newItemsCount: number;
      }
    | null
    | undefined;
};

export type SetOptionsMutationVariables = Exact<{
  opts: OptionsInput;
}>;

export type SetOptionsMutation = {
  __typename?: 'Mutation';
  setOptions: {
    __typename?: 'OptionsResponse';
    options?:
      | {
          __typename?: 'Options';
          dailyDigestHour: number;
          withContentTableDefault: boolean;
          itemBodyDefault: boolean;
          attachmentsDefault?: boolean | null | undefined;
          themeDefault: Theme;
          customSubject?: string | null | undefined;
          shareEnable: boolean;
          shareList?: Array<ShareId> | null | undefined;
        }
      | null
      | undefined;
    errors?:
      | Array<{
          __typename?: 'ArgumentError';
          message: string;
          argument?: string | null | undefined;
        }>
      | null
      | undefined;
  };
};

export type UnsubscribeByTokenMutationVariables = Exact<{
  id: Scalars['String'];
  token: Scalars['String'];
}>;

export type UnsubscribeByTokenMutation = { __typename?: 'Mutation'; unsubscribeByToken: boolean };

export type UpdateUserInfoMutationVariables = Exact<{
  userInfo: UserInfoInput;
}>;

export type UpdateUserInfoMutation = {
  __typename?: 'Mutation';
  updateUserInfo: { __typename?: 'User'; timeZone: string; locale: string };
};

export type VerifyEmailMutationVariables = Exact<{
  userId: Scalars['String'];
  token: Scalars['String'];
}>;

export type VerifyEmailMutation = {
  __typename?: 'Mutation';
  verifyEmail: {
    __typename?: 'UserResponse';
    user?:
      | {
          __typename?: 'User';
          id: number;
          role: string;
          email: string;
          emailVerified: boolean;
          locale: string;
          timeZone: string;
        }
      | null
      | undefined;
    errors?:
      | Array<{
          __typename?: 'ArgumentError';
          message: string;
          argument?: string | null | undefined;
        }>
      | null
      | undefined;
  };
};

export type GetFeedInfoByTokenQueryVariables = Exact<{
  id: Scalars['String'];
  token: Scalars['String'];
}>;

export type GetFeedInfoByTokenQuery = {
  __typename?: 'Query';
  getFeedInfoByToken?:
    | {
        __typename?: 'UserFeed';
        feed: { __typename?: 'Feed'; title?: string | null | undefined; url: string };
      }
    | null
    | undefined;
};

export type ImportStatusQueryVariables = Exact<{ [key: string]: never }>;

export type ImportStatusQuery = {
  __typename?: 'Query';
  importStatus?:
    | {
        __typename?: 'ImportStatusObject';
        state?: ImportState | null | undefined;
        progress?: number | null | undefined;
        total?: number | null | undefined;
        result?: string | null | undefined;
      }
    | null
    | undefined;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me?:
    | {
        __typename?: 'User';
        id: number;
        role: string;
        email: string;
        emailVerified: boolean;
        locale: string;
        timeZone: string;
      }
    | null
    | undefined;
};

export type MyFeedItemsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Float']>;
  take?: InputMaybe<Scalars['Float']>;
  feedId: Scalars['Float'];
  filter?: InputMaybe<Scalars['String']>;
}>;

export type MyFeedItemsQuery = {
  __typename?: 'Query';
  myFeedItems: {
    __typename?: 'PaginatedItemsResponse';
    hasMore: boolean;
    items: Array<{
      __typename?: 'Item';
      id: number;
      guid?: string | null | undefined;
      pubdate?: any | null | undefined;
      link?: string | null | undefined;
      title?: string | null | undefined;
      description?: string | null | undefined;
      summary?: string | null | undefined;
      imageUrl?: string | null | undefined;
      createdAt: any;
      enclosures?:
        | Array<{
            __typename?: 'Enclosure';
            url: string;
            length?: string | null | undefined;
            type?: string | null | undefined;
          }>
        | null
        | undefined;
    }>;
  };
};

export type MyFeedsQueryVariables = Exact<{ [key: string]: never }>;

export type MyFeedsQuery = {
  __typename?: 'Query';
  myFeeds?:
    | Array<{
        __typename?: 'UserFeed';
        id: number;
        activated: boolean;
        title?: string | null | undefined;
        schedule: DigestSchedule;
        withContentTable: TernaryState;
        itemBody: TernaryState;
        attachments: TernaryState;
        theme: Theme;
        filter?: string | null | undefined;
        createdAt: any;
        lastDigestSentAt?: any | null | undefined;
        newItemsCount: number;
        lastViewedItemDate?: any | null | undefined;
        feed: {
          __typename?: 'Feed';
          id: number;
          url: string;
          link?: string | null | undefined;
          title?: string | null | undefined;
          description?: string | null | undefined;
          language?: string | null | undefined;
          favicon?: string | null | undefined;
          siteIcon?: string | null | undefined;
          siteFavicon?: string | null | undefined;
          imageUrl?: string | null | undefined;
          imageTitle?: string | null | undefined;
          lastSuccessfulUpd: any;
          lastPubdate?: any | null | undefined;
          createdAt: any;
          updatedAt: any;
        };
      }>
    | null
    | undefined;
};

export type MyFeedsCountQueryVariables = Exact<{ [key: string]: never }>;

export type MyFeedsCountQuery = {
  __typename?: 'Query';
  myFeeds?: Array<{ __typename?: 'UserFeed'; newItemsCount: number }> | null | undefined;
};

export type MyOptionsQueryVariables = Exact<{ [key: string]: never }>;

export type MyOptionsQuery = {
  __typename?: 'Query';
  myOptions: {
    __typename?: 'Options';
    dailyDigestHour: number;
    withContentTableDefault: boolean;
    itemBodyDefault: boolean;
    attachmentsDefault?: boolean | null | undefined;
    themeDefault: Theme;
    customSubject?: string | null | undefined;
    shareEnable: boolean;
    shareList?: Array<ShareId> | null | undefined;
  };
};

export type ItemsCountUpdatedSubscriptionVariables = Exact<{ [key: string]: never }>;

export type ItemsCountUpdatedSubscription = {
  __typename?: 'Subscription';
  itemsCountUpdated: Array<{
    __typename?: 'UserFeedNewItemsCountResponse';
    feedId: number;
    count: number;
  }>;
};

export const FeedFieldsFragmentDoc = gql`
  fragment FeedFields on Feed {
    id
    url
    link
    title
    description
    language
    favicon
    siteIcon
    siteFavicon
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
    createdAt
    lastDigestSentAt
    newItemsCount
    lastViewedItemDate
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
  ${UserFieldsFragmentDoc}
`;
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
        argument
      }
    }
  }
  ${UserFeedFieldsFragmentDoc}
`;
export type ActivateFeedMutationFn = Apollo.MutationFunction<
  ActivateFeedMutation,
  ActivateFeedMutationVariables
>;

/**
 * __useActivateFeedMutation__
 *
 * To run a mutation, you first call `useActivateFeedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateFeedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateFeedMutation, { data, loading, error }] = useActivateFeedMutation({
 *   variables: {
 *      token: // value for 'token'
 *      userFeedId: // value for 'userFeedId'
 *   },
 * });
 */
export function useActivateFeedMutation(
  baseOptions?: Apollo.MutationHookOptions<ActivateFeedMutation, ActivateFeedMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ActivateFeedMutation, ActivateFeedMutationVariables>(
    ActivateFeedDocument,
    options,
  );
}
export type ActivateFeedMutationHookResult = ReturnType<typeof useActivateFeedMutation>;
export type ActivateFeedMutationResult = Apollo.MutationResult<ActivateFeedMutation>;
export type ActivateFeedMutationOptions = Apollo.BaseMutationOptions<
  ActivateFeedMutation,
  ActivateFeedMutationVariables
>;
export const AddFeedToCurrentUserDocument = gql`
  mutation addFeedToCurrentUser($feedOpts: UserFeedOptionsInput, $input: AddFeedInput!) {
    addFeedToCurrentUser(input: $input, feedOpts: $feedOpts) {
      userFeed {
        ...UserFeedFields
        feed {
          ...FeedFields
        }
      }
      errors {
        message
        argument
      }
    }
  }
  ${UserFeedFieldsFragmentDoc}
  ${FeedFieldsFragmentDoc}
`;
export type AddFeedToCurrentUserMutationFn = Apollo.MutationFunction<
  AddFeedToCurrentUserMutation,
  AddFeedToCurrentUserMutationVariables
>;

/**
 * __useAddFeedToCurrentUserMutation__
 *
 * To run a mutation, you first call `useAddFeedToCurrentUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddFeedToCurrentUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addFeedToCurrentUserMutation, { data, loading, error }] = useAddFeedToCurrentUserMutation({
 *   variables: {
 *      feedOpts: // value for 'feedOpts'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddFeedToCurrentUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddFeedToCurrentUserMutation,
    AddFeedToCurrentUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddFeedToCurrentUserMutation, AddFeedToCurrentUserMutationVariables>(
    AddFeedToCurrentUserDocument,
    options,
  );
}
export type AddFeedToCurrentUserMutationHookResult = ReturnType<
  typeof useAddFeedToCurrentUserMutation
>;
export type AddFeedToCurrentUserMutationResult =
  Apollo.MutationResult<AddFeedToCurrentUserMutation>;
export type AddFeedToCurrentUserMutationOptions = Apollo.BaseMutationOptions<
  AddFeedToCurrentUserMutation,
  AddFeedToCurrentUserMutationVariables
>;
export const AddFeedWithEmailDocument = gql`
  mutation addFeedWithEmail(
    $feedOpts: UserFeedOptionsInput
    $userInfo: UserInfoInput
    $input: AddFeedEmailInput!
  ) {
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
  ${UserFeedFieldsFragmentDoc}
`;
export type AddFeedWithEmailMutationFn = Apollo.MutationFunction<
  AddFeedWithEmailMutation,
  AddFeedWithEmailMutationVariables
>;

/**
 * __useAddFeedWithEmailMutation__
 *
 * To run a mutation, you first call `useAddFeedWithEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddFeedWithEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addFeedWithEmailMutation, { data, loading, error }] = useAddFeedWithEmailMutation({
 *   variables: {
 *      feedOpts: // value for 'feedOpts'
 *      userInfo: // value for 'userInfo'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddFeedWithEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddFeedWithEmailMutation,
    AddFeedWithEmailMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddFeedWithEmailMutation, AddFeedWithEmailMutationVariables>(
    AddFeedWithEmailDocument,
    options,
  );
}
export type AddFeedWithEmailMutationHookResult = ReturnType<typeof useAddFeedWithEmailMutation>;
export type AddFeedWithEmailMutationResult = Apollo.MutationResult<AddFeedWithEmailMutation>;
export type AddFeedWithEmailMutationOptions = Apollo.BaseMutationOptions<
  AddFeedWithEmailMutation,
  AddFeedWithEmailMutationVariables
>;
export const DeleteMeDocument = gql`
  mutation deleteMe {
    deleteUser {
      message
    }
  }
`;
export type DeleteMeMutationFn = Apollo.MutationFunction<
  DeleteMeMutation,
  DeleteMeMutationVariables
>;

/**
 * __useDeleteMeMutation__
 *
 * To run a mutation, you first call `useDeleteMeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMeMutation, { data, loading, error }] = useDeleteMeMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteMeMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteMeMutation, DeleteMeMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteMeMutation, DeleteMeMutationVariables>(DeleteMeDocument, options);
}
export type DeleteMeMutationHookResult = ReturnType<typeof useDeleteMeMutation>;
export type DeleteMeMutationResult = Apollo.MutationResult<DeleteMeMutation>;
export type DeleteMeMutationOptions = Apollo.BaseMutationOptions<
  DeleteMeMutation,
  DeleteMeMutationVariables
>;
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
export type DeleteMyFeedsMutationFn = Apollo.MutationFunction<
  DeleteMyFeedsMutation,
  DeleteMyFeedsMutationVariables
>;

/**
 * __useDeleteMyFeedsMutation__
 *
 * To run a mutation, you first call `useDeleteMyFeedsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMyFeedsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMyFeedsMutation, { data, loading, error }] = useDeleteMyFeedsMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteMyFeedsMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteMyFeedsMutation, DeleteMyFeedsMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteMyFeedsMutation, DeleteMyFeedsMutationVariables>(
    DeleteMyFeedsDocument,
    options,
  );
}
export type DeleteMyFeedsMutationHookResult = ReturnType<typeof useDeleteMyFeedsMutation>;
export type DeleteMyFeedsMutationResult = Apollo.MutationResult<DeleteMyFeedsMutation>;
export type DeleteMyFeedsMutationOptions = Apollo.BaseMutationOptions<
  DeleteMyFeedsMutation,
  DeleteMyFeedsMutationVariables
>;
export const ImportFeedsDocument = gql`
  mutation importFeeds($feedImport: [FeedImport!]!) {
    importFeeds(feeds: $feedImport) {
      errors {
        message
      }
      success
    }
  }
`;
export type ImportFeedsMutationFn = Apollo.MutationFunction<
  ImportFeedsMutation,
  ImportFeedsMutationVariables
>;

/**
 * __useImportFeedsMutation__
 *
 * To run a mutation, you first call `useImportFeedsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportFeedsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importFeedsMutation, { data, loading, error }] = useImportFeedsMutation({
 *   variables: {
 *      feedImport: // value for 'feedImport'
 *   },
 * });
 */
export function useImportFeedsMutation(
  baseOptions?: Apollo.MutationHookOptions<ImportFeedsMutation, ImportFeedsMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ImportFeedsMutation, ImportFeedsMutationVariables>(
    ImportFeedsDocument,
    options,
  );
}
export type ImportFeedsMutationHookResult = ReturnType<typeof useImportFeedsMutation>;
export type ImportFeedsMutationResult = Apollo.MutationResult<ImportFeedsMutation>;
export type ImportFeedsMutationOptions = Apollo.BaseMutationOptions<
  ImportFeedsMutation,
  ImportFeedsMutationVariables
>;
export const LoginDocument = gql`
  mutation login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      ...UsualUserResponse
    }
  }
  ${UsualUserResponseFragmentDoc}
`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(
  baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
}
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<
  LoginMutation,
  LoginMutationVariables
>;
export const LogoutDocument = gql`
  mutation logout {
    logout
  }
`;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(
  baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
}
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<
  LogoutMutation,
  LogoutMutationVariables
>;
export const RegisterDocument = gql`
  mutation register($email: String!, $password: String!) {
    register(input: { email: $email, password: $password }) {
      ...UsualUserResponse
    }
  }
  ${UsualUserResponseFragmentDoc}
`;
export type RegisterMutationFn = Apollo.MutationFunction<
  RegisterMutation,
  RegisterMutationVariables
>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useRegisterMutation(
  baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
}
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<
  RegisterMutation,
  RegisterMutationVariables
>;
export const RequestEmailVerificationDocument = gql`
  mutation requestEmailVerification {
    requestEmailVerification
  }
`;
export type RequestEmailVerificationMutationFn = Apollo.MutationFunction<
  RequestEmailVerificationMutation,
  RequestEmailVerificationMutationVariables
>;

/**
 * __useRequestEmailVerificationMutation__
 *
 * To run a mutation, you first call `useRequestEmailVerificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestEmailVerificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestEmailVerificationMutation, { data, loading, error }] = useRequestEmailVerificationMutation({
 *   variables: {
 *   },
 * });
 */
export function useRequestEmailVerificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RequestEmailVerificationMutation,
    RequestEmailVerificationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RequestEmailVerificationMutation,
    RequestEmailVerificationMutationVariables
  >(RequestEmailVerificationDocument, options);
}
export type RequestEmailVerificationMutationHookResult = ReturnType<
  typeof useRequestEmailVerificationMutation
>;
export type RequestEmailVerificationMutationResult =
  Apollo.MutationResult<RequestEmailVerificationMutation>;
export type RequestEmailVerificationMutationOptions = Apollo.BaseMutationOptions<
  RequestEmailVerificationMutation,
  RequestEmailVerificationMutationVariables
>;
export const RequestPasswordResetDocument = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      message
    }
  }
`;
export type RequestPasswordResetMutationFn = Apollo.MutationFunction<
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
>;

/**
 * __useRequestPasswordResetMutation__
 *
 * To run a mutation, you first call `useRequestPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestPasswordResetMutation, { data, loading, error }] = useRequestPasswordResetMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useRequestPasswordResetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RequestPasswordResetMutation,
    RequestPasswordResetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>(
    RequestPasswordResetDocument,
    options,
  );
}
export type RequestPasswordResetMutationHookResult = ReturnType<
  typeof useRequestPasswordResetMutation
>;
export type RequestPasswordResetMutationResult =
  Apollo.MutationResult<RequestPasswordResetMutation>;
export type RequestPasswordResetMutationOptions = Apollo.BaseMutationOptions<
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
>;
export const ResetPasswordDocument = gql`
  mutation resetPassword($input: PasswordResetInput!) {
    resetPassword(input: $input) {
      ...UsualUserResponse
    }
  }
  ${UsualUserResponseFragmentDoc}
`;
export type ResetPasswordMutationFn = Apollo.MutationFunction<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useResetPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(
    ResetPasswordDocument,
    options,
  );
}
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const SendFeedbackDocument = gql`
  mutation sendFeedback($input: FeedbackInput!) {
    feedback(input: $input) {
      success
      errors {
        argument
        message
      }
    }
  }
`;
export type SendFeedbackMutationFn = Apollo.MutationFunction<
  SendFeedbackMutation,
  SendFeedbackMutationVariables
>;

/**
 * __useSendFeedbackMutation__
 *
 * To run a mutation, you first call `useSendFeedbackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendFeedbackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendFeedbackMutation, { data, loading, error }] = useSendFeedbackMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSendFeedbackMutation(
  baseOptions?: Apollo.MutationHookOptions<SendFeedbackMutation, SendFeedbackMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SendFeedbackMutation, SendFeedbackMutationVariables>(
    SendFeedbackDocument,
    options,
  );
}
export type SendFeedbackMutationHookResult = ReturnType<typeof useSendFeedbackMutation>;
export type SendFeedbackMutationResult = Apollo.MutationResult<SendFeedbackMutation>;
export type SendFeedbackMutationOptions = Apollo.BaseMutationOptions<
  SendFeedbackMutation,
  SendFeedbackMutationVariables
>;
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
  ${UserFeedFieldsFragmentDoc}
`;
export type SetFeedOptionsMutationFn = Apollo.MutationFunction<
  SetFeedOptionsMutation,
  SetFeedOptionsMutationVariables
>;

/**
 * __useSetFeedOptionsMutation__
 *
 * To run a mutation, you first call `useSetFeedOptionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetFeedOptionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setFeedOptionsMutation, { data, loading, error }] = useSetFeedOptionsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      opts: // value for 'opts'
 *   },
 * });
 */
export function useSetFeedOptionsMutation(
  baseOptions?: Apollo.MutationHookOptions<SetFeedOptionsMutation, SetFeedOptionsMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SetFeedOptionsMutation, SetFeedOptionsMutationVariables>(
    SetFeedOptionsDocument,
    options,
  );
}
export type SetFeedOptionsMutationHookResult = ReturnType<typeof useSetFeedOptionsMutation>;
export type SetFeedOptionsMutationResult = Apollo.MutationResult<SetFeedOptionsMutation>;
export type SetFeedOptionsMutationOptions = Apollo.BaseMutationOptions<
  SetFeedOptionsMutation,
  SetFeedOptionsMutationVariables
>;
export const SetLastViewedItemDateDocument = gql`
  mutation setLastViewedItemDate($itemId: Float!, $userFeedId: Float!) {
    setLastViewedItemDate(itemId: $itemId, userFeedId: $userFeedId) {
      id
      lastViewedItemDate
      newItemsCount
    }
  }
`;
export type SetLastViewedItemDateMutationFn = Apollo.MutationFunction<
  SetLastViewedItemDateMutation,
  SetLastViewedItemDateMutationVariables
>;

/**
 * __useSetLastViewedItemDateMutation__
 *
 * To run a mutation, you first call `useSetLastViewedItemDateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetLastViewedItemDateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setLastViewedItemDateMutation, { data, loading, error }] = useSetLastViewedItemDateMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *      userFeedId: // value for 'userFeedId'
 *   },
 * });
 */
export function useSetLastViewedItemDateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetLastViewedItemDateMutation,
    SetLastViewedItemDateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SetLastViewedItemDateMutation, SetLastViewedItemDateMutationVariables>(
    SetLastViewedItemDateDocument,
    options,
  );
}
export type SetLastViewedItemDateMutationHookResult = ReturnType<
  typeof useSetLastViewedItemDateMutation
>;
export type SetLastViewedItemDateMutationResult =
  Apollo.MutationResult<SetLastViewedItemDateMutation>;
export type SetLastViewedItemDateMutationOptions = Apollo.BaseMutationOptions<
  SetLastViewedItemDateMutation,
  SetLastViewedItemDateMutationVariables
>;
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
  ${OptionsFieldsFragmentDoc}
`;
export type SetOptionsMutationFn = Apollo.MutationFunction<
  SetOptionsMutation,
  SetOptionsMutationVariables
>;

/**
 * __useSetOptionsMutation__
 *
 * To run a mutation, you first call `useSetOptionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetOptionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setOptionsMutation, { data, loading, error }] = useSetOptionsMutation({
 *   variables: {
 *      opts: // value for 'opts'
 *   },
 * });
 */
export function useSetOptionsMutation(
  baseOptions?: Apollo.MutationHookOptions<SetOptionsMutation, SetOptionsMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SetOptionsMutation, SetOptionsMutationVariables>(
    SetOptionsDocument,
    options,
  );
}
export type SetOptionsMutationHookResult = ReturnType<typeof useSetOptionsMutation>;
export type SetOptionsMutationResult = Apollo.MutationResult<SetOptionsMutation>;
export type SetOptionsMutationOptions = Apollo.BaseMutationOptions<
  SetOptionsMutation,
  SetOptionsMutationVariables
>;
export const UnsubscribeByTokenDocument = gql`
  mutation unsubscribeByToken($id: String!, $token: String!) {
    unsubscribeByToken(id: $id, token: $token)
  }
`;
export type UnsubscribeByTokenMutationFn = Apollo.MutationFunction<
  UnsubscribeByTokenMutation,
  UnsubscribeByTokenMutationVariables
>;

/**
 * __useUnsubscribeByTokenMutation__
 *
 * To run a mutation, you first call `useUnsubscribeByTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnsubscribeByTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unsubscribeByTokenMutation, { data, loading, error }] = useUnsubscribeByTokenMutation({
 *   variables: {
 *      id: // value for 'id'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useUnsubscribeByTokenMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UnsubscribeByTokenMutation,
    UnsubscribeByTokenMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UnsubscribeByTokenMutation, UnsubscribeByTokenMutationVariables>(
    UnsubscribeByTokenDocument,
    options,
  );
}
export type UnsubscribeByTokenMutationHookResult = ReturnType<typeof useUnsubscribeByTokenMutation>;
export type UnsubscribeByTokenMutationResult = Apollo.MutationResult<UnsubscribeByTokenMutation>;
export type UnsubscribeByTokenMutationOptions = Apollo.BaseMutationOptions<
  UnsubscribeByTokenMutation,
  UnsubscribeByTokenMutationVariables
>;
export const UpdateUserInfoDocument = gql`
  mutation updateUserInfo($userInfo: UserInfoInput!) {
    updateUserInfo(userInfo: $userInfo) {
      timeZone
      locale
    }
  }
`;
export type UpdateUserInfoMutationFn = Apollo.MutationFunction<
  UpdateUserInfoMutation,
  UpdateUserInfoMutationVariables
>;

/**
 * __useUpdateUserInfoMutation__
 *
 * To run a mutation, you first call `useUpdateUserInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserInfoMutation, { data, loading, error }] = useUpdateUserInfoMutation({
 *   variables: {
 *      userInfo: // value for 'userInfo'
 *   },
 * });
 */
export function useUpdateUserInfoMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateUserInfoMutation, UpdateUserInfoMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateUserInfoMutation, UpdateUserInfoMutationVariables>(
    UpdateUserInfoDocument,
    options,
  );
}
export type UpdateUserInfoMutationHookResult = ReturnType<typeof useUpdateUserInfoMutation>;
export type UpdateUserInfoMutationResult = Apollo.MutationResult<UpdateUserInfoMutation>;
export type UpdateUserInfoMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserInfoMutation,
  UpdateUserInfoMutationVariables
>;
export const VerifyEmailDocument = gql`
  mutation verifyEmail($userId: String!, $token: String!) {
    verifyEmail(userId: $userId, token: $token) {
      ...UsualUserResponse
    }
  }
  ${UsualUserResponseFragmentDoc}
`;
export type VerifyEmailMutationFn = Apollo.MutationFunction<
  VerifyEmailMutation,
  VerifyEmailMutationVariables
>;

/**
 * __useVerifyEmailMutation__
 *
 * To run a mutation, you first call `useVerifyEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyEmailMutation, { data, loading, error }] = useVerifyEmailMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useVerifyEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<VerifyEmailMutation, VerifyEmailMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<VerifyEmailMutation, VerifyEmailMutationVariables>(
    VerifyEmailDocument,
    options,
  );
}
export type VerifyEmailMutationHookResult = ReturnType<typeof useVerifyEmailMutation>;
export type VerifyEmailMutationResult = Apollo.MutationResult<VerifyEmailMutation>;
export type VerifyEmailMutationOptions = Apollo.BaseMutationOptions<
  VerifyEmailMutation,
  VerifyEmailMutationVariables
>;
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

/**
 * __useGetFeedInfoByTokenQuery__
 *
 * To run a query within a React component, call `useGetFeedInfoByTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeedInfoByTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeedInfoByTokenQuery({
 *   variables: {
 *      id: // value for 'id'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useGetFeedInfoByTokenQuery(
  baseOptions: Apollo.QueryHookOptions<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>(
    GetFeedInfoByTokenDocument,
    options,
  );
}
export function useGetFeedInfoByTokenLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFeedInfoByTokenQuery,
    GetFeedInfoByTokenQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>(
    GetFeedInfoByTokenDocument,
    options,
  );
}
export type GetFeedInfoByTokenQueryHookResult = ReturnType<typeof useGetFeedInfoByTokenQuery>;
export type GetFeedInfoByTokenLazyQueryHookResult = ReturnType<
  typeof useGetFeedInfoByTokenLazyQuery
>;
export type GetFeedInfoByTokenQueryResult = Apollo.QueryResult<
  GetFeedInfoByTokenQuery,
  GetFeedInfoByTokenQueryVariables
>;
export const ImportStatusDocument = gql`
  query importStatus {
    importStatus {
      state
      progress
      total
      result
    }
  }
`;

/**
 * __useImportStatusQuery__
 *
 * To run a query within a React component, call `useImportStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useImportStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useImportStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useImportStatusQuery(
  baseOptions?: Apollo.QueryHookOptions<ImportStatusQuery, ImportStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ImportStatusQuery, ImportStatusQueryVariables>(
    ImportStatusDocument,
    options,
  );
}
export function useImportStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ImportStatusQuery, ImportStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ImportStatusQuery, ImportStatusQueryVariables>(
    ImportStatusDocument,
    options,
  );
}
export type ImportStatusQueryHookResult = ReturnType<typeof useImportStatusQuery>;
export type ImportStatusLazyQueryHookResult = ReturnType<typeof useImportStatusLazyQuery>;
export type ImportStatusQueryResult = Apollo.QueryResult<
  ImportStatusQuery,
  ImportStatusQueryVariables
>;
export const MeDocument = gql`
  query me {
    me {
      ...UserFields
    }
  }
  ${UserFieldsFragmentDoc}
`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const MyFeedItemsDocument = gql`
  query myFeedItems($skip: Float, $take: Float, $feedId: Float!, $filter: String) {
    myFeedItems(skip: $skip, take: $take, feedId: $feedId, filter: $filter) {
      items {
        ...ItemFields
      }
      hasMore
    }
  }
  ${ItemFieldsFragmentDoc}
`;

/**
 * __useMyFeedItemsQuery__
 *
 * To run a query within a React component, call `useMyFeedItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyFeedItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyFeedItemsQuery({
 *   variables: {
 *      skip: // value for 'skip'
 *      take: // value for 'take'
 *      feedId: // value for 'feedId'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useMyFeedItemsQuery(
  baseOptions: Apollo.QueryHookOptions<MyFeedItemsQuery, MyFeedItemsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MyFeedItemsQuery, MyFeedItemsQueryVariables>(MyFeedItemsDocument, options);
}
export function useMyFeedItemsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MyFeedItemsQuery, MyFeedItemsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MyFeedItemsQuery, MyFeedItemsQueryVariables>(
    MyFeedItemsDocument,
    options,
  );
}
export type MyFeedItemsQueryHookResult = ReturnType<typeof useMyFeedItemsQuery>;
export type MyFeedItemsLazyQueryHookResult = ReturnType<typeof useMyFeedItemsLazyQuery>;
export type MyFeedItemsQueryResult = Apollo.QueryResult<
  MyFeedItemsQuery,
  MyFeedItemsQueryVariables
>;
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
  ${FeedFieldsFragmentDoc}
`;

/**
 * __useMyFeedsQuery__
 *
 * To run a query within a React component, call `useMyFeedsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyFeedsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyFeedsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyFeedsQuery(
  baseOptions?: Apollo.QueryHookOptions<MyFeedsQuery, MyFeedsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MyFeedsQuery, MyFeedsQueryVariables>(MyFeedsDocument, options);
}
export function useMyFeedsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MyFeedsQuery, MyFeedsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MyFeedsQuery, MyFeedsQueryVariables>(MyFeedsDocument, options);
}
export type MyFeedsQueryHookResult = ReturnType<typeof useMyFeedsQuery>;
export type MyFeedsLazyQueryHookResult = ReturnType<typeof useMyFeedsLazyQuery>;
export type MyFeedsQueryResult = Apollo.QueryResult<MyFeedsQuery, MyFeedsQueryVariables>;
export const MyFeedsCountDocument = gql`
  query myFeedsCount {
    myFeeds {
      newItemsCount
    }
  }
`;

/**
 * __useMyFeedsCountQuery__
 *
 * To run a query within a React component, call `useMyFeedsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyFeedsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyFeedsCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyFeedsCountQuery(
  baseOptions?: Apollo.QueryHookOptions<MyFeedsCountQuery, MyFeedsCountQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MyFeedsCountQuery, MyFeedsCountQueryVariables>(
    MyFeedsCountDocument,
    options,
  );
}
export function useMyFeedsCountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MyFeedsCountQuery, MyFeedsCountQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MyFeedsCountQuery, MyFeedsCountQueryVariables>(
    MyFeedsCountDocument,
    options,
  );
}
export type MyFeedsCountQueryHookResult = ReturnType<typeof useMyFeedsCountQuery>;
export type MyFeedsCountLazyQueryHookResult = ReturnType<typeof useMyFeedsCountLazyQuery>;
export type MyFeedsCountQueryResult = Apollo.QueryResult<
  MyFeedsCountQuery,
  MyFeedsCountQueryVariables
>;
export const MyOptionsDocument = gql`
  query myOptions {
    myOptions {
      ...OptionsFields
    }
  }
  ${OptionsFieldsFragmentDoc}
`;

/**
 * __useMyOptionsQuery__
 *
 * To run a query within a React component, call `useMyOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyOptionsQuery(
  baseOptions?: Apollo.QueryHookOptions<MyOptionsQuery, MyOptionsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MyOptionsQuery, MyOptionsQueryVariables>(MyOptionsDocument, options);
}
export function useMyOptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MyOptionsQuery, MyOptionsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MyOptionsQuery, MyOptionsQueryVariables>(MyOptionsDocument, options);
}
export type MyOptionsQueryHookResult = ReturnType<typeof useMyOptionsQuery>;
export type MyOptionsLazyQueryHookResult = ReturnType<typeof useMyOptionsLazyQuery>;
export type MyOptionsQueryResult = Apollo.QueryResult<MyOptionsQuery, MyOptionsQueryVariables>;
export const ItemsCountUpdatedDocument = gql`
  subscription itemsCountUpdated {
    itemsCountUpdated {
      feedId
      count
    }
  }
`;

/**
 * __useItemsCountUpdatedSubscription__
 *
 * To run a query within a React component, call `useItemsCountUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useItemsCountUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useItemsCountUpdatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useItemsCountUpdatedSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    ItemsCountUpdatedSubscription,
    ItemsCountUpdatedSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    ItemsCountUpdatedSubscription,
    ItemsCountUpdatedSubscriptionVariables
  >(ItemsCountUpdatedDocument, options);
}
export type ItemsCountUpdatedSubscriptionHookResult = ReturnType<
  typeof useItemsCountUpdatedSubscription
>;
export type ItemsCountUpdatedSubscriptionResult =
  Apollo.SubscriptionResult<ItemsCountUpdatedSubscription>;
