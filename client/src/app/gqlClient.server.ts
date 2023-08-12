import { GraphQLClient } from 'graphql-request';
import { headers } from 'next/headers';
import { cache } from 'react';

import { getSdk } from '@/gql/generated';

export const getGQLClient = cache(() => {
  return getSdk(
    new GraphQLClient('http://localhost:4000/graphql', {
      credentials: 'include',
      headers: () => ({
        cookie: headers().get('cookie') || '',
      }),
    }),
  );
});
