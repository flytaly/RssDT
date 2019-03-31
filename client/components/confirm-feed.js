import React, { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import StyledCard from './styled/card';
import CardHeader from './card-header';
import GraphQLError from './graphql-error';

const CONFIRM_SUBSCRIPTION_MUTATION = gql`
  mutation CONFIRM_SUBSCRIPTION_MUTATION(
    $token: String!
  ) {
    confirmSubscription(
        token: $token
    ) {
        message
    }
  }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items:center;
    width:100%;
    padding: 1rem 3rem;
`;

const Msg = styled.div`
    padding-top: 4rem;
`;

const ConfirmFeed = ({ token }) => {
    const [message, setMessage] = useState('Confirming subscription...');
    const [errorMsg, setErrorMsg] = useState('');
    const confirmSubscription = useMutation(CONFIRM_SUBSCRIPTION_MUTATION);

    useEffect(() => {
        async function confirm() {
            try {
                const { data } = await confirmSubscription({ variables: { token } });
                setMessage(data.confirmSubscription.message);
            } catch (e) {
                setErrorMsg(e.message);
                setMessage('');
            }
        }

        confirm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <StyledCard>
            <Container>
                <CardHeader />
                <div data-testid="message">
                    {message && <Msg>{message}</Msg>}
                    {errorMsg && <Msg><GraphQLError error={errorMsg} /></Msg>}
                </div>
            </Container>
        </StyledCard>
    );
};

ConfirmFeed.propTypes = {
    token: PropTypes.string,
};

ConfirmFeed.defaultProps = {
    token: '',
};

export default ConfirmFeed;
export { CONFIRM_SUBSCRIPTION_MUTATION };
