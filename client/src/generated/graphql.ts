import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
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
  input: ItemsInput;
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
  schedule: DigestSchedule;
  withContentTable: TernaryState;
  itemBody: TernaryState;
  attachments: TernaryState;
  theme: Theme;
  lastDigestSentAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
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
  count: Scalars['Float'];
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

export type ItemsInput = {
  feedId: Scalars['Float'];
  skip?: Maybe<Scalars['Float']>;
  take?: Maybe<Scalars['Float']>;
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
  schedule?: Maybe<Scalars['String']>;
  withContentTable?: Maybe<Scalars['String']>;
  itemBody?: Maybe<Scalars['String']>;
  attachments?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
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

export type FeedFieldsFragment = (
  { __typename?: 'Feed' }
  & Pick<Feed, 'id' | 'url' | 'link' | 'title' | 'description' | 'language' | 'favicon' | 'imageUrl' | 'imageTitle' | 'lastSuccessfulUpd' | 'createdAt' | 'updatedAt'>
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
  & Pick<UserFeed, 'id' | 'activated' | 'schedule' | 'withContentTable' | 'itemBody' | 'attachments' | 'theme' | 'createdAt' | 'lastDigestSentAt'>
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
      & Pick<ArgumentError, 'message' | 'argument'>
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
      & { feed: (
        { __typename?: 'Feed' }
        & FeedFieldsFragment
      ) }
      & UserFeedFieldsFragment
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

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
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
    & UsualUserResponseFragment
  ) }
);

export type UnsubscribeByTokenMutationVariables = Exact<{
  id: Scalars['String'];
  token: Scalars['String'];
}>;


export type UnsubscribeByTokenMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'unsubscribeByToken'>
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
  schedule
  withContentTable
  itemBody
  attachments
  theme
  createdAt
  lastDigestSentAt
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
      argument
    }
  }
}
    ${UserFeedFieldsFragmentDoc}`;
export type ActivateFeedMutationFn = Apollo.MutationFunction<ActivateFeedMutation, ActivateFeedMutationVariables>;

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
export function useActivateFeedMutation(baseOptions?: Apollo.MutationHookOptions<ActivateFeedMutation, ActivateFeedMutationVariables>) {
        return Apollo.useMutation<ActivateFeedMutation, ActivateFeedMutationVariables>(ActivateFeedDocument, baseOptions);
      }
export type ActivateFeedMutationHookResult = ReturnType<typeof useActivateFeedMutation>;
export type ActivateFeedMutationResult = Apollo.MutationResult<ActivateFeedMutation>;
export type ActivateFeedMutationOptions = Apollo.BaseMutationOptions<ActivateFeedMutation, ActivateFeedMutationVariables>;
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
${FeedFieldsFragmentDoc}`;
export type AddFeedToCurrentUserMutationFn = Apollo.MutationFunction<AddFeedToCurrentUserMutation, AddFeedToCurrentUserMutationVariables>;

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
export function useAddFeedToCurrentUserMutation(baseOptions?: Apollo.MutationHookOptions<AddFeedToCurrentUserMutation, AddFeedToCurrentUserMutationVariables>) {
        return Apollo.useMutation<AddFeedToCurrentUserMutation, AddFeedToCurrentUserMutationVariables>(AddFeedToCurrentUserDocument, baseOptions);
      }
export type AddFeedToCurrentUserMutationHookResult = ReturnType<typeof useAddFeedToCurrentUserMutation>;
export type AddFeedToCurrentUserMutationResult = Apollo.MutationResult<AddFeedToCurrentUserMutation>;
export type AddFeedToCurrentUserMutationOptions = Apollo.BaseMutationOptions<AddFeedToCurrentUserMutation, AddFeedToCurrentUserMutationVariables>;
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
export type AddFeedWithEmailMutationFn = Apollo.MutationFunction<AddFeedWithEmailMutation, AddFeedWithEmailMutationVariables>;

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
export function useAddFeedWithEmailMutation(baseOptions?: Apollo.MutationHookOptions<AddFeedWithEmailMutation, AddFeedWithEmailMutationVariables>) {
        return Apollo.useMutation<AddFeedWithEmailMutation, AddFeedWithEmailMutationVariables>(AddFeedWithEmailDocument, baseOptions);
      }
export type AddFeedWithEmailMutationHookResult = ReturnType<typeof useAddFeedWithEmailMutation>;
export type AddFeedWithEmailMutationResult = Apollo.MutationResult<AddFeedWithEmailMutation>;
export type AddFeedWithEmailMutationOptions = Apollo.BaseMutationOptions<AddFeedWithEmailMutation, AddFeedWithEmailMutationVariables>;
export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  login(input: {email: $email, password: $password}) {
    ...UsualUserResponse
  }
}
    ${UsualUserResponseFragmentDoc}`;
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
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
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
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const RegisterDocument = gql`
    mutation register($email: String!, $password: String!) {
  register(input: {email: $email, password: $password}) {
    ...UsualUserResponse
  }
}
    ${UsualUserResponseFragmentDoc}`;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

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
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, baseOptions);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const RequestPasswordResetDocument = gql`
    mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email) {
    message
  }
}
    `;
export type RequestPasswordResetMutationFn = Apollo.MutationFunction<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;

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
export function useRequestPasswordResetMutation(baseOptions?: Apollo.MutationHookOptions<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>) {
        return Apollo.useMutation<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>(RequestPasswordResetDocument, baseOptions);
      }
export type RequestPasswordResetMutationHookResult = ReturnType<typeof useRequestPasswordResetMutation>;
export type RequestPasswordResetMutationResult = Apollo.MutationResult<RequestPasswordResetMutation>;
export type RequestPasswordResetMutationOptions = Apollo.BaseMutationOptions<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation resetPassword($input: PasswordResetInput!) {
  resetPassword(input: $input) {
    ...UsualUserResponse
  }
}
    ${UsualUserResponseFragmentDoc}`;
export type ResetPasswordMutationFn = Apollo.MutationFunction<ResetPasswordMutation, ResetPasswordMutationVariables>;

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
export function useResetPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, baseOptions);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const UnsubscribeByTokenDocument = gql`
    mutation unsubscribeByToken($id: String!, $token: String!) {
  unsubscribeByToken(id: $id, token: $token)
}
    `;
export type UnsubscribeByTokenMutationFn = Apollo.MutationFunction<UnsubscribeByTokenMutation, UnsubscribeByTokenMutationVariables>;

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
export function useUnsubscribeByTokenMutation(baseOptions?: Apollo.MutationHookOptions<UnsubscribeByTokenMutation, UnsubscribeByTokenMutationVariables>) {
        return Apollo.useMutation<UnsubscribeByTokenMutation, UnsubscribeByTokenMutationVariables>(UnsubscribeByTokenDocument, baseOptions);
      }
export type UnsubscribeByTokenMutationHookResult = ReturnType<typeof useUnsubscribeByTokenMutation>;
export type UnsubscribeByTokenMutationResult = Apollo.MutationResult<UnsubscribeByTokenMutation>;
export type UnsubscribeByTokenMutationOptions = Apollo.BaseMutationOptions<UnsubscribeByTokenMutation, UnsubscribeByTokenMutationVariables>;
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
export function useGetFeedInfoByTokenQuery(baseOptions: Apollo.QueryHookOptions<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>) {
        return Apollo.useQuery<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>(GetFeedInfoByTokenDocument, baseOptions);
      }
export function useGetFeedInfoByTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>) {
          return Apollo.useLazyQuery<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>(GetFeedInfoByTokenDocument, baseOptions);
        }
export type GetFeedInfoByTokenQueryHookResult = ReturnType<typeof useGetFeedInfoByTokenQuery>;
export type GetFeedInfoByTokenLazyQueryHookResult = ReturnType<typeof useGetFeedInfoByTokenLazyQuery>;
export type GetFeedInfoByTokenQueryResult = Apollo.QueryResult<GetFeedInfoByTokenQuery, GetFeedInfoByTokenQueryVariables>;
export const MeDocument = gql`
    query me {
  me {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;

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
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
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
export function useMyFeedsQuery(baseOptions?: Apollo.QueryHookOptions<MyFeedsQuery, MyFeedsQueryVariables>) {
        return Apollo.useQuery<MyFeedsQuery, MyFeedsQueryVariables>(MyFeedsDocument, baseOptions);
      }
export function useMyFeedsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyFeedsQuery, MyFeedsQueryVariables>) {
          return Apollo.useLazyQuery<MyFeedsQuery, MyFeedsQueryVariables>(MyFeedsDocument, baseOptions);
        }
export type MyFeedsQueryHookResult = ReturnType<typeof useMyFeedsQuery>;
export type MyFeedsLazyQueryHookResult = ReturnType<typeof useMyFeedsLazyQuery>;
export type MyFeedsQueryResult = Apollo.QueryResult<MyFeedsQuery, MyFeedsQueryVariables>;