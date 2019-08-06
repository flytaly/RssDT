import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import StyledCard from './styled/card';
import CardHeader from './card-header';
import GraphQLError from './graphql-error';
import Container from './styled/card-inner-container';

const UNSUBSCRIBE_MUTATION = gql`mutation (
    $token: String!
  ){
    unsubscribe (
      token: $token
    ) {
      id
    }
}`;

const StyledSuccessMsg = styled.h2`
`;

const StyledErrorMsg = styled.h2`
    color: ${props => props.theme.errorMsgColor};
`;

// eslint-disable-next-line react/prop-types
const Message = ({ error, success }) => {
    if (error) return <StyledErrorMsg><GraphQLError error={error} /></StyledErrorMsg>;
    return <StyledSuccessMsg>{success}</StyledSuccessMsg>;
};

const Unsubscribe = ({ token }) => {
    const [onSuccessMsg, setOnSuccessMsg] = useState('');
    const [onErrorMsg, setOnErrorMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [unsubscribeMutation] = useMutation(UNSUBSCRIBE_MUTATION);

    const unsubscribeEffect = useCallback(async () => {
        try {
            const { data } = await unsubscribeMutation({ variables: { token } });
            if (data.unsubscribe) {
                setOnSuccessMsg('Successfully unsubscribed');
            }
        } catch (e) {
            setOnErrorMsg(e.message);
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => { unsubscribeEffect(); }, [unsubscribeEffect]);

    return (
        <StyledCard>
            <Container>
                <CardHeader />
                {loading
                    ? <Message success="unsubscribing..." />
                    : <Message error={onErrorMsg} success={onSuccessMsg} />}
            </Container>
        </StyledCard>
    );
};

Unsubscribe.propTypes = {
    token: PropTypes.string,
};

Unsubscribe.defaultProps = {
    token: '',
};

export default Unsubscribe;
export { UNSUBSCRIBE_MUTATION };
