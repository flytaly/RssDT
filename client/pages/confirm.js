import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmFeed from '../components/confirm-feed';

const ConfirmPage = ({ query }) => <ConfirmFeed token={query.token} />;

ConfirmPage.propTypes = {
    query: PropTypes.shape({ token: PropTypes.string.isRequired }).isRequired,
};

export default ConfirmPage;
