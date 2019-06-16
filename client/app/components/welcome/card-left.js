import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { StyledLightHalf as CardHalf } from '../styled/card-half';
import GraphQLError from '../graphql-error';

const Message = styled.div`
    border: 1px solid ${props => props.color};
    color: ${props => props.color};
    padding: 1rem;
    word-break: break-word;
    border-radius: 3px;
`;

const CardLeft = ({ messages: { error, success } }) => (
    <CardHalf>
        <p>Enter address of a feed (rss, atom) and your email to receive updates every chosen period.</p>
        {(error || success) && (
            <Message color={error ? 'red' : 'green'} data-testid="add-feed-message">
                {error && <GraphQLError error={error} />}
                {success && success}
            </Message>)
        }
    </CardHalf>
);
CardLeft.propTypes = {
    messages: PropTypes.shape({
        error: PropTypes.string,
        success: PropTypes.string,
    }),
};
CardLeft.defaultProps = {
    messages: { error: '', success: '' },
};

export default CardLeft;
