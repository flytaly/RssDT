import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  testRecords?: Maybe<Array<TestEntity>>;
};

export type TestEntity = {
  __typename?: 'TestEntity';
  id: Scalars['Float'];
  text: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createTestRecord: TestEntity;
  clearRecords: Scalars['Boolean'];
};


export type MutationCreateTestRecordArgs = {
  text: Scalars['String'];
};

export type TestMutationMutationVariables = Exact<{
  text: Scalars['String'];
}>;


export type TestMutationMutation = (
  { __typename?: 'Mutation' }
  & { createTestRecord: (
    { __typename?: 'TestEntity' }
    & Pick<TestEntity, 'text'>
  ) }
);

export type TestQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type TestQueryQuery = (
  { __typename?: 'Query' }
  & { testRecords?: Maybe<Array<(
    { __typename?: 'TestEntity' }
    & Pick<TestEntity, 'text'>
  )>> }
);


export const TestMutationDocument = gql`
    mutation testMutation($text: String!) {
  createTestRecord(text: $text) {
    text
  }
}
    `;
export const TestQueryDocument = gql`
    query testQuery {
  testRecords {
    text
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    testMutation(variables: TestMutationMutationVariables): Promise<TestMutationMutation> {
      return withWrapper(() => client.request<TestMutationMutation>(print(TestMutationDocument), variables));
    },
    testQuery(variables?: TestQueryQueryVariables): Promise<TestQueryQuery> {
      return withWrapper(() => client.request<TestQueryQuery>(print(TestQueryDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;