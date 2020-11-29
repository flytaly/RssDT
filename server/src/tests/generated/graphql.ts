import { GraphQLClient } from 'graphql-request';
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
  myFeeds?: Maybe<Array<UserFeed>>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['Float'];
  email: Scalars['String'];
  role: Scalars['String'];
  userFeeds?: Maybe<Array<UserFeed>>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  feeds: Array<UserFeed>;
};

export type UserFeed = {
  __typename?: 'UserFeed';
  id: Scalars['Float'];
  userId: Scalars['Float'];
  feedId: Scalars['Float'];
  user: User;
  feed: Feed;
  activated: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type Feed = {
  __typename?: 'Feed';
  id: Scalars['Float'];
  url: Scalars['String'];
  userFeeds?: Maybe<Array<UserFeed>>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};


export type Mutation = {
  __typename?: 'Mutation';
  register: UserResponse;
  login: UserResponse;
  addFeedWithEmail?: Maybe<UserFeedResponse>;
  addFeedToCurrentUser: UserFeedResponse;
};


export type MutationRegisterArgs = {
  password: Scalars['String'];
  email: Scalars['String'];
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  email: Scalars['String'];
};


export type MutationAddFeedWithEmailArgs = {
  feedUrl: Scalars['String'];
  email: Scalars['String'];
};


export type MutationAddFeedToCurrentUserArgs = {
  feedUrl: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type UserFeedResponse = {
  __typename?: 'UserFeedResponse';
  errors?: Maybe<Array<FieldError>>;
  userFeed?: Maybe<UserFeed>;
};

export type UserFieldsFragment = (
  { __typename?: 'User' }
  & Pick<User, 'id' | 'role' | 'email'>
);

export type UsualUserResponseFragment = (
  { __typename?: 'UserResponse' }
  & { user?: Maybe<(
    { __typename?: 'User' }
    & UserFieldsFragment
  )>, errors?: Maybe<Array<(
    { __typename?: 'FieldError' }
    & Pick<FieldError, 'message' | 'field'>
  )>> }
);

export type AddFeedToCurrentUserMutationVariables = Exact<{
  feedUrl: Scalars['String'];
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
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'message' | 'field'>
    )>> }
  ) }
);

export type AddFeedWithEmailMutationVariables = Exact<{
  email: Scalars['String'];
  feedUrl: Scalars['String'];
}>;


export type AddFeedWithEmailMutation = (
  { __typename?: 'Mutation' }
  & { addFeedWithEmail?: Maybe<(
    { __typename?: 'UserFeedResponse' }
    & { userFeed?: Maybe<(
      { __typename?: 'UserFeed' }
      & Pick<UserFeed, 'id' | 'activated'>
      & { feed: (
        { __typename?: 'Feed' }
        & Pick<Feed, 'id' | 'url'>
      ) }
    )>, errors?: Maybe<Array<(
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'message' | 'field'>
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
        & Pick<Feed, 'url'>
      ) }
    )> }
    & UserFieldsFragment
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

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = (
  { __typename?: 'Query' }
  & { users?: Maybe<Array<(
    { __typename?: 'User' }
    & UserFieldsFragment
  )>> }
);

export const UserFieldsFragmentDoc = gql`
    fragment UserFields on User {
  id
  role
  email
}
    `;
export const UsualUserResponseFragmentDoc = gql`
    fragment UsualUserResponse on UserResponse {
  user {
    ...UserFields
  }
  errors {
    message
    field
  }
}
    ${UserFieldsFragmentDoc}`;
export const AddFeedToCurrentUserDocument = gql`
    mutation addFeedToCurrentUser($feedUrl: String!) {
  addFeedToCurrentUser(feedUrl: $feedUrl) {
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
      field
    }
  }
}
    `;
export const AddFeedWithEmailDocument = gql`
    mutation addFeedWithEmail($email: String!, $feedUrl: String!) {
  addFeedWithEmail(email: $email, feedUrl: $feedUrl) {
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
      field
    }
  }
}
    `;
export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    ...UsualUserResponse
  }
}
    ${UsualUserResponseFragmentDoc}`;
export const RegisterDocument = gql`
    mutation register($email: String!, $password: String!) {
  register(email: $email, password: $password) {
    ...UsualUserResponse
  }
}
    ${UsualUserResponseFragmentDoc}`;
export const MeWithFeedsDocument = gql`
    query meWithFeeds {
  me {
    ...UserFields
    feeds {
      activated
      createdAt
      feed {
        url
      }
    }
  }
}
    ${UserFieldsFragmentDoc}`;
export const MeDocument = gql`
    query me {
  me {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
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
    addFeedToCurrentUser(variables: AddFeedToCurrentUserMutationVariables): Promise<AddFeedToCurrentUserMutation> {
      return withWrapper(() => client.request<AddFeedToCurrentUserMutation>(print(AddFeedToCurrentUserDocument), variables));
    },
    addFeedWithEmail(variables: AddFeedWithEmailMutationVariables): Promise<AddFeedWithEmailMutation> {
      return withWrapper(() => client.request<AddFeedWithEmailMutation>(print(AddFeedWithEmailDocument), variables));
    },
    login(variables: LoginMutationVariables): Promise<LoginMutation> {
      return withWrapper(() => client.request<LoginMutation>(print(LoginDocument), variables));
    },
    register(variables: RegisterMutationVariables): Promise<RegisterMutation> {
      return withWrapper(() => client.request<RegisterMutation>(print(RegisterDocument), variables));
    },
    meWithFeeds(variables?: MeWithFeedsQueryVariables): Promise<MeWithFeedsQuery> {
      return withWrapper(() => client.request<MeWithFeedsQuery>(print(MeWithFeedsDocument), variables));
    },
    me(variables?: MeQueryVariables): Promise<MeQuery> {
      return withWrapper(() => client.request<MeQuery>(print(MeDocument), variables));
    },
    users(variables?: UsersQueryVariables): Promise<UsersQuery> {
      return withWrapper(() => client.request<UsersQuery>(print(UsersDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;