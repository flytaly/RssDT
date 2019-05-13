import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import { MY_FEED_ITEMS_QUERY, FEED_ITEMS_CONNECTION } from '../../queries';
import FeedItemsListView from './feed-items-list-view';

const useQueryWithPagination = ({ feedId, first = 20, orderBy = 'pubDate_DESC' }) => {
    const variables = { feedId, first, orderBy };
    const items = useQuery(MY_FEED_ITEMS_QUERY, {
        notifyOnNetworkStatusChange: true,
        variables,
    });
    const itemsConnection = useQuery(FEED_ITEMS_CONNECTION, {
        notifyOnNetworkStatusChange: true,
        variables,
    });

    const data = {
        items: get(items, 'data.myFeedItems', []),
        canFetchMore: get(itemsConnection, 'data.feedItemsConnection.pageInfo.hasNextPage', false),
    };
    const loading = items.loading || itemsConnection.loading;
    const error = items.error || itemsConnection.error;

    // eslint-disable-next-line no-shadow
    const fetchMore = (variables) => {
        items.fetchMore({
            variables,
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult || !fetchMoreResult.myFeedItems.length) return prev;

                return Object.assign({}, prev,
                    { myFeedItems: [...prev.myFeedItems, ...fetchMoreResult.myFeedItems] });
            },
        });
        itemsConnection.fetchMore({ variables,
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;

                return fetchMoreResult;
            } });
    };

    return { data, loading, fetchMore, error };
};

function FeedItems({ feedId }) {
    const itemsPerFetch = 20;
    const {
        data: { items, canFetchMore }, error, loading, fetchMore,
    } = useQueryWithPagination({ feedId, first: itemsPerFetch });
    if (error) { console.error(error); }
    const memoizedFetchMore = useCallback(fetchMore, [items]);
    return (
        <FeedItemsListView
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
