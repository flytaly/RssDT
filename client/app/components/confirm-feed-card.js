import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import StyledCard from './styled/card';
import CardHeader from './card-header';
import GraphQLError from './graphql-error';
import Container from './styled/card-inner-container';

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

const Message = styled.div`
    margin-top: 4rem;
    color: ${props => props.color};
`;

const ConfirmFeed = ({ token }) => {
    const [message, setMessage] = useState('Confirming subscription...');
    const [errorMsg, setErrorMsg] = useState('');
    const [confirmSubscription] = useMutation(CONFIRM_SUBSCRIPTION_MUTATION);

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
                <Message color={errorMsg ? 'red' : 'inherit'} data-testid="confirm-message">
                    {errorMsg ? <GraphQLError error={errorMsg} /> : message}
                </Message>
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
