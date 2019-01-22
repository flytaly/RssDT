import withApollo from 'next-with-apollo';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { GRAPHQL_URL } from '../configs';

export default withApollo(({ /* ctx, */headers, initialState }) => {
    console.log({ headers });

    return (new ApolloClient({
        // https://www.apollographql.com/docs/react/essentials/get-started.html#configuration
        uri: GRAPHQL_URL,
        cache: new InMemoryCache().restore(initialState || {}),
    }));
});
