'use client';

import { GraphQLClient } from 'graphql-request';

import { getSdk } from '@/gql/generated';

type WithSDK = {
  gqlClient: ReturnType<typeof getSdk>;
};

export const getGQLClient = () => {
  if (typeof window !== 'undefined' && (window as unknown as WithSDK).gqlClient) {
    return (window as unknown as WithSDK).gqlClient;
  }

  const client = getSdk(
    new GraphQLClient('http://localhost:4000/graphql', {
      credentials: 'include',
    }),
  );

  (window as unknown as WithSDK).gqlClient = client;
  return client;
};
