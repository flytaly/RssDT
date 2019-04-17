import { useQuery } from 'react-apollo-hooks';
import Router from 'next/router';
import ME_QUERY from '../../queries/me-query';
import StyledCard from '../styled/card';
/**
 * @param {boolean} redirectOnFail - Redirect to /login if user isn't authenticated
 * @returns {function} HOC that fetches user info and pass it as 'me' prop to the wrapped component
 */
const withAuth = (redirectOnFail = false) => (Component) => {
    const WrappingComponent = (props) => {
        const { data, error } = useQuery(ME_QUERY);

        const redirectPath = '/login';
        if (error) {
            if (error.message !== 'GraphQL error: Authentication is required') {
                console.error(error.message);
            }
            if (Router.pathname !== redirectPath && redirectOnFail) {
                Router.replace(redirectPath);
            }
        }

        if (redirectOnFail && !data.me) { return <StyledCard />; }

        return <Component {...props} me={data.me} />;
    };

    WrappingComponent.getInitialProps = Component.getInitialProps;

    return WrappingComponent;
};

export default withAuth;
