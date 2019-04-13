import { useEffect } from 'react';
import Router from 'next/router';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import StyledCard from '../components/styled/card';

const LOGOUT_MUTATION = gql`
    mutation LOGOUT_MUTATION{
        logOut @client
    }
`;

const Logout = () => {
    const logout = useMutation(LOGOUT_MUTATION);
    useEffect(() => {
        logout()
            .then(() => Router.replace('/'))
            .catch(e => console.error(e));
    });

    return (<StyledCard>Logging out</StyledCard>);
};

export default Logout;
