import { GraphQLClient } from 'graphql-request';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';

import { API_URL } from '@/constants';
import { getSdk } from '@/gql/generated';

const COOKIE_NAME = 'qid';

export const getGQLServerClient = cache(() => {
  return getSdk(
    new GraphQLClient(API_URL, {
      credentials: 'include',
      headers: () => ({
        // Pass cookie to the GraphQL API server
        cookie: headers().get('cookie') || '',
      }),
      responseMiddleware: (response) => {
        // NOTE: Not sure how to properly pass through cookie from GraphQL API
        // server to the client in Next 13 server actions.
        if (!(response instanceof Error) && !response.errors) {
          const setCookie = response.headers.get('set-cookie');
          if (!setCookie) return;
          const split = setCookie.split('; ');
          const [name, value] = split[0].split('=');
          if (name !== COOKIE_NAME) return;
          cookies().set({
            name,
            value: decodeURIComponent(value),
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 5),
            sameSite: 'lax',
            secure: true,
            httpOnly: true,
          });
        }
      },
    }),
  );
});
