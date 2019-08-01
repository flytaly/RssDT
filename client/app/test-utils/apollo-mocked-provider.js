import { MockLink } from 'react-apollo/test-links';
import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo-hooks';
import PropTypes from 'prop-types';
import resolvers from '../lib/resolvers';

function createClient(mocks) {
    return new ApolloClient({
        cache: new InMemoryCache({ addTypename: true }),
        link: new MockLink(mocks),
        resolvers,
    });
}

function ApolloMockedProvider({ mocks, children }) {
    const client = createClient(mocks);
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}

ApolloMockedProvider.propTypes = {
    children: PropTypes.node.isRequired,
    mocks: PropTypes.arrayOf(
        PropTypes.shape({
            request: PropTypes.shape.isRequired,
            result: PropTypes.shape.isRequired,
        }),
    ).isRequired,
};

export default ApolloMockedProvider;
