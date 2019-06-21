import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-boost';
import { GRAPHQL_URL } from '../configs';

const client = new ApolloClient({
    connectToDevTools: process.browser,
    link: new HttpLink({
        uri: GRAPHQL_URL,
        credentials: 'include',
    }),
    cache: new InMemoryCache(),
});

export default client;
