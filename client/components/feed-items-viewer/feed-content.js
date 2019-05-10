import React from 'react';
import styled from 'styled-components';

const Container = styled.section`
    flex-grow: 1;
    background-color: ${props => props.theme.feedViewBgColor};
    padding: 2rem 1rem 1rem 2rem;
    border-bottom-right-radius: 9px;
    @media all and (max-width: ${props => props.theme.tableMinWidth}) {
        border-bottom-left-radius: 9px;
    }
`;

function FeedContent() {
    return (
        <Container>Feed content</Container>
    );
}

export default FeedContent;
