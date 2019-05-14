import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import throttle from 'lodash.throttle';
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
    const loadMoreRef = useRef(null);
    const lastId = items.length ? items[items.length - 1].id : null;

    useEffect(() => {
        const fetchItemsIfNeeded = throttle(() => {
            if (!lastId || !canFetchMore || loading) return;
            const { top } = loadMoreRef.current.getBoundingClientRect();
            const { clientHeight } = document.documentElement;
            if (top <= clientHeight) {
                fetchMore(lastId);
            }
        }, 400);
        if (!window.pageYOffset) fetchItemsIfNeeded();
        window.addEventListener('scroll', fetchItemsIfNeeded);
        window.addEventListener('resize', fetchItemsIfNeeded);
        return () => {
            window.removeEventListener('scroll', fetchItemsIfNeeded);
            window.removeEventListener('resize', fetchItemsIfNeeded);
        };
    }, [lastId, canFetchMore, fetchMore, loading]);

    return (
        <StyledItemContainer>
            <StyledItemList>
                {items.map(item => (
                    <li key={item.id}>
                        <h4>{item.title}</h4>
                        <div>{item.description}</div>
                    </li>
                ))}
            </StyledItemList>
            <div ref={loadMoreRef}>
                {
                    (canFetchMore || loading)
                        ? <SpinnerContainer><Spinner /></SpinnerContainer>
                        : 'All items have been loaded'
                }
            </div>
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
