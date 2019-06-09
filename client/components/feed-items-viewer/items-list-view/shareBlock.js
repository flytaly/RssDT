import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledShareBlock = styled.ul`
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 0;
    li {
        margin-right: 0.5rem;
    }
    img {
        width: 1.6rem;
    }
`;

const shareBlock = ({ shares, itemTitle, itemLink }) => (
    <StyledShareBlock>
        {shares.map(({ id, iconUrl, title, getUrl }) => (
            <li key={id}>
                <a href={getUrl(itemLink, itemTitle)} title={title}>
                    <img src={iconUrl} alt={title} />
                </a>
            </li>))}
    </StyledShareBlock>
);

shareBlock.propTypes = {
    shares: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    itemTitle: PropTypes.string.isRequired,
    itemLink: PropTypes.string.isRequired,
};


export default shareBlock;
