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
  myFeedItems: PaginatedItemsResponse;
};


export type QueryMyFeedItemsArgs = {
  input: ItemsInput;
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
  link?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  activated: Scalars['Boolean'];
  language?: Maybe<Scalars['String']>;
  favicon?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  imageTitle?: Maybe<Scalars['String']>;
  userFeeds?: Maybe<Array<UserFeed>>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
  lastSuccessfulUpd: Scalars['DateTime'];
};


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
  login: UserResponse;
  addFeedWithEmail?: Maybe<UserFeedResponse>;
  addFeedToCurrentUser: UserFeedResponse;
  deleteMyFeeds: DeletedFeedResponse;
};


export type MutationRegisterArgs = {
  input: EmailPasswordInput;
};


export type MutationLoginArgs = {
  input: EmailPasswordInput;
};


export type MutationAddFeedWithEmailArgs = {
  input: AddFeedEmailInput;
};


export type MutationAddFeedToCurrentUserArgs = {
  input: AddFeedInput;
};


export type MutationDeleteMyFeedsArgs = {
  ids: Array<Scalars['Float']>;
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

export type EmailPasswordInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type UserFeedResponse = {
  __typename?: 'UserFeedResponse';
  errors?: Maybe<Array<ArgumentError>>;
  userFeed?: Maybe<UserFeed>;
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
  & Pick<Feed, 'id' | 'url' | 'link' | 'title' | 'description' | 'activated' | 'language' | 'favicon' | 'imageUrl' | 'imageTitle' | 'lastSuccessfulUpd' | 'createdAt' | 'updatedAt'>
  & { userFeeds?: Maybe<Array<(
    { __typename?: 'UserFeed' }
    & Pick<UserFeed, 'userId'>
  )>> }
);

export type ItemFieldsFragment = (
  { __typename?: 'Item' }
  & Pick<Item, 'id' | 'guid' | 'pubdate' | 'link' | 'title' | 'description' | 'summary' | 'imageUrl' | 'createdAt'>
  & { enclosures?: Maybe<Array<(
    { __typename?: 'Enclosure' }
    & Pick<Enclosure, 'url' | 'length' | 'type'>
  )>> }
);

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
    { __typename?: 'ArgumentError' }
    & Pick<ArgumentError, 'message' | 'argument'>
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
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message' | 'argument'>
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
      { __typename?: 'ArgumentError' }
      & Pick<ArgumentError, 'message' | 'argument'>
    )>> }
  )> }
);

export type DeleteMyFeedsMutationVariables = Exact<{
  ids: Array<Scalars['Float']>;
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

export type MyFeedItemsQueryVariables = Exact<{
  skip?: Maybe<Scalars['Float']>;
  take?: Maybe<Scalars['Float']>;
  feedId: Scalars['Float'];
}>;


export type MyFeedItemsQuery = (
  { __typename?: 'Query' }
  & { myFeedItems: (
    { __typename?: 'PaginatedItemsResponse' }
    & Pick<PaginatedItemsResponse, 'count'>
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
    & Pick<UserFeed, 'id' | 'userId' | 'activated'>
    & { feed: (
      { __typename?: 'Feed' }
      & FeedFieldsFragment
    ) }
  )>> }
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
    fragment feedFields on Feed {
  id
  url
  link
  title
  description
  activated
  language
  favicon
  imageUrl
  imageTitle
  lastSuccessfulUpd
  userFeeds {
    userId
  }
  createdAt
  updatedAt
}
    `;
export const ItemFieldsFragmentDoc = gql`
    fragment itemFields on Item {
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
    argument
  }
}
    ${UserFieldsFragmentDoc}`;
export const AddFeedToCurrentUserDocument = gql`
    mutation addFeedToCurrentUser($feedUrl: String!) {
  addFeedToCurrentUser(input: {feedUrl: $feedUrl}) {
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
    mutation addFeedWithEmail($email: String!, $feedUrl: String!) {
  addFeedWithEmail(input: {email: $email, feedUrl: $feedUrl}) {
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
        ...feedFields
      }
    }
  }
}
    ${UserFieldsFragmentDoc}
${FeedFieldsFragmentDoc}`;
export const MyFeedItemsDocument = gql`
    query myFeedItems($skip: Float, $take: Float, $feedId: Float!) {
  myFeedItems(input: {skip: $skip, take: $take, feedId: $feedId}) {
    items {
      ...itemFields
    }
    count
  }
}
    ${ItemFieldsFragmentDoc}`;
export const MyFeedsDocument = gql`
    query myFeeds {
  myFeeds {
    id
    userId
    activated
    feed {
      ...feedFields
    }
  }
}
    ${FeedFieldsFragmentDoc}`;
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
    deleteMyFeeds(variables: DeleteMyFeedsMutationVariables): Promise<DeleteMyFeedsMutation> {
      return withWrapper(() => client.request<DeleteMyFeedsMutation>(print(DeleteMyFeedsDocument), variables));
    },
    login(variables: LoginMutationVariables): Promise<LoginMutation> {
      return withWrapper(() => client.request<LoginMutation>(print(LoginDocument), variables));
    },
    register(variables: RegisterMutationVariables): Promise<RegisterMutation> {
      return withWrapper(() => client.request<RegisterMutation>(print(RegisterDocument), variables));
    },
    me(variables?: MeQueryVariables): Promise<MeQuery> {
      return withWrapper(() => client.request<MeQuery>(print(MeDocument), variables));
    },
    meWithFeeds(variables?: MeWithFeedsQueryVariables): Promise<MeWithFeedsQuery> {
      return withWrapper(() => client.request<MeWithFeedsQuery>(print(MeWithFeedsDocument), variables));
    },
    myFeedItems(variables: MyFeedItemsQueryVariables): Promise<MyFeedItemsQuery> {
      return withWrapper(() => client.request<MyFeedItemsQuery>(print(MyFeedItemsDocument), variables));
    },
    myFeeds(variables?: MyFeedsQueryVariables): Promise<MyFeedsQuery> {
      return withWrapper(() => client.request<MyFeedsQuery>(print(MyFeedsDocument), variables));
    },
    users(variables?: UsersQueryVariables): Promise<UsersQuery> {
      return withWrapper(() => client.request<UsersQuery>(print(UsersDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;