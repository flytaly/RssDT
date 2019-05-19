import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import { MY_FEED_ITEMS_QUERY, FEED_ITEMS_CONNECTION } from '../../queries';
import ItemsListView from './items-list-view';

const useQueryWithPagination = ({ feedId, first = 20, orderBy = 'pubDate_DESC' }) => {
    const variables = { feedId, first, orderBy };
    const queryOptions = { notifyOnNetworkStatusChange: true, variables, errorPolicy: 'all' };
    const items = useQuery(MY_FEED_ITEMS_QUERY, queryOptions);
    const itemsConnection = useQuery(FEED_ITEMS_CONNECTION, queryOptions);

    const data = {
        items: get(items, 'data.myFeedItems', []),
        canFetchMore: get(itemsConnection, 'data.feedItemsConnection.pageInfo.hasNextPage', false),
    };
    const loading = items.loading || itemsConnection.loading;
    const error = items.error || itemsConnection.error;

    const fetchMore = (after) => {
        items.fetchMore({
            variables: { after },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult || !fetchMoreResult.myFeedItems.length) return prev;

                return Object.assign({}, prev,
                    { myFeedItems: [...prev.myFeedItems, ...fetchMoreResult.myFeedItems] });
            },
        });
        itemsConnection.fetchMore({
            variables: { after },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;

                return fetchMoreResult;
            },
        });
    };

    return { data, loading, fetchMore, error };
};

function reducer(state, action) {
    switch (action.type) {
        case 'setPrevAfter':
            return { prevAfter: action.payload };
        default:
            throw new Error(`There is no action with type ${action.type}`);
    }
}

function FeedItems({ feedId }) {
    const itemsPerFetch = 15;
    const {
        data: { items, canFetchMore }, error, loading, fetchMore,
    } = useQueryWithPagination({ feedId, first: itemsPerFetch });
    const [state, dispatch] = useReducer(reducer, { prevAfter: null });

    // ? For some reasons (maybe because I combine 2 useQuery?) useCallback doesn't
    // ? always work here so I use useReducer to prevent fetching the same results.
    // * Still, there is a problem. If an error happens during fetchMore
    // * it won't be caught and passed to 'error' property,
    // * hence loading new items will stop until page reloading.
    const memoizedFetchMore = (after) => {
        if (state.prevAfter === after) return;
        dispatch({ type: 'setPrevAfter', payload: after });
        fetchMore(after);
    };

    if (error) {
        console.error(error);
        if (state.prevAfter) { dispatch({ type: 'setPrevAfter', payload: null }); }
    }
    return (
        <ItemsListView
            items={items}
            fetchMore={memoizedFetchMore}
            canFetchMore={canFetchMore}
            loading={loading}
        />
    );
}
FeedItems.propTypes = {
    feedId: PropTypes.string.isRequired,
};

export default FeedItems;
