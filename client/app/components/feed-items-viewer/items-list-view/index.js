import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import throttle from 'lodash.throttle';
import Spinner from '../../spinner';
import FeedItem from './item';

const StyledItemContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const StyledItemList = styled.ul`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 70rem;
    list-style: none;
    margin: 0;
    padding: 0;
`;

const SpinnerContainer = styled.div`
    width: 2rem;
    margin: 0 auto;
`;

function ItemsListView({ items, fetchMore, loading, canFetchMore, me }) {
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
                {items.map(item => <FeedItem
                    item={item}
                    key={item.id}
                    timeZone={me.timeZone}
                    locale={me.locale}
                    shareEnable={me.shareEnable}
                    filterShare={me.filterShare}
                />)}
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

ItemsListView.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({})),
    fetchMore: PropTypes.func,
    loading: PropTypes.bool,
    canFetchMore: PropTypes.bool,
    me: PropTypes.shape({ locale: PropTypes.string, timeZone: PropTypes.string }),
};
ItemsListView.defaultProps = {
    items: [],
    fetchMore: () => {},
    loading: false,
    canFetchMore: false,
    me: {},
};

export default ItemsListView;
