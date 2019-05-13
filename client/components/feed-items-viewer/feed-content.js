import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useApolloClient } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import FeedItems from './feed-items';

const feedFragment = gql`
    fragment feed on UserFeed {
        feed {
            id
            title
            url
            link
            imageUrl
            imageTitle
        }
    }
`;

const Container = styled.section`
    flex-grow: 1;
    background-color: ${props => props.theme.feedViewBgColor};
    padding: 2rem 1rem 1rem 2rem;
    border-bottom-right-radius: 9px;
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
        border-bottom-left-radius: 9px;
    }
`;
const FeedTitleH = styled.h2`
    font-size: 1.6rem;
    margin: 0;
`;

function FeedContent({ id }) {
    const client = useApolloClient();
    let feedInfo = {};
    try {
        const result = client.readFragment({
            id: `UserFeed:${id}`,
            fragment: feedFragment,
        });
        feedInfo = result && result.feed ? result.feed : {};
    } catch (e) { console.error('Error during readFragment:', e); }

    if (!id || !feedInfo.id) return (<Container>Choose a feed to display its items</Container>);

    return (
        <Container>
            <FeedTitleH>{feedInfo.title || feedInfo.url}</FeedTitleH>
            <FeedItems feedId={feedInfo.id} />
        </Container>
    );
}

FeedContent.propTypes = {
    id: PropTypes.string,
};

FeedContent.defaultProps = {
    id: null,
};


export default FeedContent;
