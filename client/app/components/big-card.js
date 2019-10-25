import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import BigCardHeader from './big-card-header';
import AddFeedModal from './add-feed-modal';

const StyledBigCard = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    background: ${props => props.theme.cardBackground};
    color: ${props => props.theme.fontColor};
    width: ${props => props.theme.bigCardWidth}rem;
    max-width: calc(100vw - 2rem);
    min-height: 53rem;
    margin: 1rem auto;
    border-radius: 10px;
`;

const BigCard = ({ page, children }) => (
    <StyledBigCard id="bigCard">
        <BigCardHeader page={page} />
        {children}
        <AddFeedModal />
    </StyledBigCard>
);

BigCard.propTypes = {
    page: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
};

export default BigCard;
