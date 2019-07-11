import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-boost';
import fetch from 'isomorphic-unfetch';
import { GRAPHQL_URL } from '../configs';
import resolvers from './resolvers';

let apolloClient = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
    global.fetch = fetch;
}

function create(initialState, headers = {}) {
    return new ApolloClient({
        connectToDevTools: process.browser,
        ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
        link: new HttpLink({
            uri: GRAPHQL_URL,
            credentials: 'include',
            headers,
        }),
        cache: new InMemoryCache().restore(initialState || {}),
        resolvers,
    });
}


export default function initApollo(initialState, headers) {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    if (!process.browser) {
        return create(initialState, headers); // pass headers with cookie in SSR mode for authorization
    }

    // Reuse client on the client-side
    if (!apolloClient) {
        apolloClient = create(initialState);
    }

    return apolloClient;
}
