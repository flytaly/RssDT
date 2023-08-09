import { QueryClient } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import { cache } from 'react';

import { getSdk } from '@/gql/generated';

/* Create a request-scoped singleton instance of QueryClient.
 * This ensures that data is not shared between different users and requests, while still only creating the QueryClient once per request.
 * https://tanstack.com/query/latest/docs/react/guides/ssr#streaming-suspense-and-server-side-fetching
 * */
export const getQueryClient = cache(() => new QueryClient());

export const getGQLClient = cache(() => {
  return getSdk(
    new GraphQLClient('http://localhost:4000/graphql', {
      credentials: 'include',
    }),
  );
});
