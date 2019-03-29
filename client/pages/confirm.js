import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmFeed from '../components/confirm-feed';

class Post extends Component {
    static propTypes = {
        token: PropTypes.string.isRequired,
    }

    static async getInitialProps({ query }) {
        return { token: query.token };
    }

    render() {
        const { token } = this.props;
        return <ConfirmFeed token={token} />;
    }
}

export default Post;
