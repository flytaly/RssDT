import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Spinner from '../spinner';

const StyledItemContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const StyledItemList = styled.ul`
    display: flex;
    flex-direction: column;
    max-width: 90rem;
    list-style: none;
    margin: 0;
    padding: 0;
    li {
        display: flex;
        flex-direction: column;
        background-color: white;
        margin: 1rem 0;
        padding: 1rem;
    }
`;

const SpinnerContainer = styled.div`
    width: 2rem;
    margin: 0 auto;
`;

function FeedItemsListView({ items, fetchMore, loading, canFetchMore }) {
    const list = useRef(null);
    const lastId = items.length ? items[items.length - 1].id : null;

    useEffect(() => {
        if (!lastId || !canFetchMore) return;

        const { clientHeight } = document.documentElement;
        const { bottom } = list.current.getBoundingClientRect();
        if (bottom < clientHeight) {
            fetchMore({ after: lastId });
        }
    }, [lastId, canFetchMore, fetchMore]);

    // TODO: Add resize and scroll listener that call fetchMore

    return (
        <StyledItemContainer>
            <StyledItemList ref={list}>
                {items.map(item => (
                    <li key={item.id}>
                        <h4>{item.title}</h4>
                        <div>{item.description}</div>
                    </li>
                ))}
            </StyledItemList>
            {(canFetchMore || loading) && <SpinnerContainer><Spinner /></SpinnerContainer>}
        </StyledItemContainer>
    );
}

FeedItemsListView.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({})),
    fetchMore: PropTypes.func,
    loading: PropTypes.bool,
    canFetchMore: PropTypes.bool,
};
FeedItemsListView.defaultProps = {
    items: [],
    fetchMore: () => {},
    loading: false,
    canFetchMore: false,
};

export default FeedItemsListView;
