import React from 'react';
import PropTypes from 'prop-types';

const GraphQLError = ({ error }) => <span style={{ color: 'red' }} data-testid="error-message">{error.replace(/^GraphQL error:/, '')}</span>;

GraphQLError.propTypes = {
    error: PropTypes.string.isRequired,
};

export default GraphQLError;
