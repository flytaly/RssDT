import React from 'react';
import PropTypes from 'prop-types';
import CardHalf from './styled/card-half';
import GraphQLError from './graphql-error';


const CardLeft = ({ messages: { error, success } }) => (
    <CardHalf>
        <p>Enter address of desired feed, email and we will send you updates every chosen period.</p>
        {error && <GraphQLError error={error}>{error}</GraphQLError>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
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
