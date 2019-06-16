import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { InlineTextButton } from '../styled/buttons';

const RESEND_ACTIVATION_LINK_MUTATION = gql`mutation (
    $id: ID!,
  ) {
    resendActivationLink(
      id: $id
    ) {
      message
    }
  }`;

const StyledContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
`;
const StyledMessage = styled.div`
    border: 1px solid red;
    padding: 0.5rem;
    background-color: ${props => props.theme.feedViewItemBg};
`;

const NotActivatedWarning = ({ id }) => {
    const [isSent, setIsSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const sendLinkMutation = useMutation(RESEND_ACTIVATION_LINK_MUTATION, { variables: { id } });
    const clickHandler = async () => {
        setLoading(true);
        try {
            const { data } = await sendLinkMutation();
            if (data && data.resendActivationLink && data.resendActivationLink.message) {
                setIsSent(true);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const getButtonText = () => {
        if (loading) return 'sending...';
        if (isSent) return 'Activation link has been sent';
        return 'Send activation link again';
    };

    return (
        <StyledContainer>
            <StyledMessage>
                <span>The feed is not activated. Check your mail. </span>
                <InlineTextButton onClick={clickHandler} disabled={isSent || loading}>
                    { getButtonText() }
                </InlineTextButton>
            </StyledMessage>
        </StyledContainer>
    );
};

NotActivatedWarning.propTypes = {
    id: PropTypes.string.isRequired,
};

export default NotActivatedWarning;
