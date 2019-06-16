import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import get from 'lodash.get';
import StyledCard from './styled/card';
import { DeleteButton } from './styled/buttons';
import CardHeader from './card-header';
import GraphQLError from './graphql-error';
import Container from './styled/card-inner-container';

const USER_FEED_TITLE_QUERY = gql`query (
    $id: ID!
  ) {
    userFeedTitle(
      id: $id
    ) {
      title
    }
}`;

const REQUEST_UNSUBSCRIBE_MUTATION = gql`mutation (
    $id: ID!
  ) {
    requestUnsubscribe(
      id: $id
    ) {
      message
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

const RequestUnsubscribe = ({ id }) => {
    const [onSuccessMsg, setOnSuccessMsg] = useState('');
    const [onErrorMsg, setOnErrorMsg] = useState('');
    const [loadingRequest, setLoadingRequest] = useState(false);
    const { data: titleData, error } = useQuery(USER_FEED_TITLE_QUERY, { variables: { id } });
    const requestUnsubscribe = useMutation(REQUEST_UNSUBSCRIBE_MUTATION);

    const clickHandler = useCallback(async () => {
        setLoadingRequest(true);
        try {
            const result = await requestUnsubscribe(
                { variables: { id } },
            );
            if (get(result, 'data.requestUnsubscribe.message') === 'OK') {
                setOnSuccessMsg('Email with confirmation link has been sent to you. Check your mail.');
            }
        } catch (e) {
            setOnErrorMsg(e.message);
        }
        setLoadingRequest(false);
    }, [id, requestUnsubscribe]);

    const errorMsg = (error && error.message) || onErrorMsg;
    return (
        <StyledCard>
            <Container>
                <CardHeader />
                {(onSuccessMsg || errorMsg)
                    ? <Message error={errorMsg} success={onSuccessMsg} />
                    : (
                        <>
                            <h2>
                                <span>Do you want to unsubscribe from: </span>
                                <b>{get(titleData, 'userFeedTitle.title', '')}</b>
                                <span>?</span>
                            </h2>
                            <DeleteButton onClick={clickHandler} disabled={loadingRequest}>Unsubscribe</DeleteButton>
                        </>
                    )
                }
            </Container>
        </StyledCard>
    );
};

RequestUnsubscribe.propTypes = {
    id: PropTypes.string,
};

RequestUnsubscribe.defaultProps = {
    id: '',
};

export default RequestUnsubscribe;
export { REQUEST_UNSUBSCRIBE_MUTATION };
