'use client';

import { GraphQLClient } from 'graphql-request';

import { API_URL } from '@/constants';
import { getSdk } from '@/gql/generated';

type WithSDK = {
  gqlClient: ReturnType<typeof getSdk>;
};

export const getGQLClient = () => {
  if (typeof window === 'undefined') {
    console.warn('This function should not be called on server side');
  }

  if (typeof window !== 'undefined' && (window as unknown as WithSDK).gqlClient) {
    return (window as unknown as WithSDK).gqlClient;
  }

  const client = getSdk(
    new GraphQLClient(API_URL, {
      credentials: 'include',
    }),
  );

  (window as unknown as WithSDK).gqlClient = client;
  return client;
};
