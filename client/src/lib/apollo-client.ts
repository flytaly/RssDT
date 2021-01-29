/* eslint-disable @typescript-eslint/naming-convention */

/* From example: https://github.com/vercel/next.js/tree/canary/examples/with-apollo */

import { ApolloClient, HttpLink, InMemoryCache, NormalizedCache, Reference } from '@apollo/client';
import merge from 'deepmerge';
import isEqual from 'lodash.isequal';
import { useMemo } from 'react';
import { PaginatedItemsResponse } from '../generated/graphql';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

interface PaginatedItemsRef extends Omit<PaginatedItemsResponse, 'items'> {
  items: Array<Reference>;
}

let apolloClient: ApolloClient<NormalizedCache>;

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      uri: 'http://localhost:4000/graphql', // Server URL (must be absolute)
      credentials: 'include', // Additional fetch() options like `credentials` or `headers`
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            myFeedItems: {
              keyArgs: ['feedId'],
              merge(
                existing: PaginatedItemsRef | undefined,
                incoming: PaginatedItemsRef,
              ): PaginatedItemsRef {
                const existingItems = existing?.items || [];
                const refs = new Set(existingItems.map((i) => i.__ref));
                const incomingItems = incoming.items.filter((i) => !refs.has(i.__ref));
                return { ...incoming, items: [...existingItems, ...incomingItems] };
              },
            },
          },
        },
      },
    }),
  });
}

export function initializeApollo(initialState: any = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray: any, sourceArray: any) => [
        ...sourceArray,
        ...destinationArray.filter((d: any) => sourceArray.every((s: any) => !isEqual(d, s))),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client: ApolloClient<NormalizedCache>, pageProps: any) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: any) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(() => initializeApollo(state), [state]);
  return store;
}
