import React from 'react';
import PropTypes from 'prop-types';

const GraphQLError = ({ error }) => <>{error.replace(/^GraphQL error:/, '')}</>;

GraphQLError.propTypes = {
    error: PropTypes.string.isRequired,
};

export default GraphQLError;
