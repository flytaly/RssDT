import React from 'react';
import styled from 'styled-components';
import FeedListSidebar from './feed-items-viewer/feed-list-sidebar';
import FeedContent from './feed-items-viewer/feed-content';

const Container = styled.main`
    display: flex;
    position: relative; /* For sidebar */
    flex-direction: row;
    flex-grow: 1;
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
        flex-direction: column;
    }
`;

function ViewFeedItems() {
    return (
        <Container>
            <FeedListSidebar />
            <FeedContent />
        </Container>);
}

export default ViewFeedItems;
