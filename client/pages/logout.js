import { useEffect } from 'react';
import Router from 'next/router';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import StyledCard from '../components/styled/card';

const LOGOUT_MUTATION = gql`
    mutation {
        signOut { message }
    }
`;

// clear local cache
const LOGOUT_CLIENT_MUTATION = gql`
    mutation { logOut @client }
`;

const Logout = () => {
    const logout = useMutation(LOGOUT_MUTATION);
    const logoutLocal = useMutation(LOGOUT_CLIENT_MUTATION);

    useEffect(() => {
        Promise.all([logoutLocal(), logout()])
            .then(() => Router.replace('/'))
            .catch(e => console.error(e));
    });

    return <StyledCard>Logging out...</StyledCard>;
};

export default Logout;
export { LOGOUT_MUTATION, LOGOUT_CLIENT_MUTATION };
