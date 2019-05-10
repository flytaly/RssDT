import React from 'react';
import styled from 'styled-components';

const StyledFeedList = styled.ul`
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    margin: 0;
    li {
        padding: 0 1rem 0 1.5rem;
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    li:hover {
        background-color: ${props => props.theme.feedListHoverBgColor};
    }
    a {
        color: ${props => props.theme.feedListFontColor};
        text-decoration: none;
    }
`;

function FeedList() {
    return (
        <StyledFeedList>
            <li><a href="#">Feed name 1</a></li>
            <li><a href="#">Very very very very long feed name</a></li>
            <li><a href="#">Feed name 3</a></li>
        </StyledFeedList>
    );
}

export default FeedList;
