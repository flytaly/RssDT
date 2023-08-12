import { GraphQLClient } from 'graphql-request';
import { cache } from 'react';

import { getSdk } from '@/gql/generated';

export const getGQLClient = cache(() => {
  return getSdk(
    new GraphQLClient('http://localhost:4000/graphql', {
      credentials: 'include',
    }),
  );
});
