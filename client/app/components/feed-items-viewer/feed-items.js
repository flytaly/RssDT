import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import { MY_FEED_ITEMS_CONNECTION, ME_QUERY } from '../../queries';
import ItemsListView from './items-list-view';

const useQueryWithPagination = ({ feedId, first = 20, orderBy = 'pubDate_DESC' }) => {
    const variables = { feedId, first, orderBy };
    const queryOptions = { notifyOnNetworkStatusChange: true, variables, errorPolicy: 'all' };
    const itemsConnection = useQuery(MY_FEED_ITEMS_CONNECTION, queryOptions);
    const data = {
        items: get(itemsConnection, 'data.myFeedItemsConnection.edges', []).map(({ node }) => node),
        canFetchMore: get(itemsConnection, 'data.myFeedItemsConnection.pageInfo.hasNextPage', false),
    };
    const { loading, error } = itemsConnection;

    const fetchMore = after => itemsConnection.fetchMore({
        variables: { after },
        updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult || !fetchMoreResult.myFeedItemsConnection) return prev;
            const edgesPrev = get(prev, 'myFeedItemsConnection.edges', []);
            const edgesNew = get(fetchMoreResult, 'myFeedItemsConnection.edges', []);
            const edges = [...edgesPrev, ...edgesNew];
            const myFeedItemsConnection = { ...fetchMoreResult.myFeedItemsConnection, edges };
            return { myFeedItemsConnection };
        },
    });
    return { data, loading, fetchMore, error };
};

function FeedItems({ feedId }) {
    const itemsPerFetch = 15;
    const {
        data: { items, canFetchMore }, error, loading, fetchMore,
    } = useQueryWithPagination({ feedId, first: itemsPerFetch });
    const { data: meData } = useQuery(ME_QUERY);
    const [prevLastId, setPrevLastId] = useState(null);

    if (error) { console.error(error); setPrevLastId(null); }

    const memoizedFetchMore = async (lastId) => {
        if (prevLastId === lastId) return;
        setPrevLastId(lastId);
        const result = await fetchMore(lastId);
        if (result.errors) { result.errors.forEach(e => console.error(e.message)); setPrevLastId(null); }
    };

    return (
        <ItemsListView
            items={items}
            fetchMore={memoizedFetchMore}
            canFetchMore={canFetchMore}
            loading={loading}
            me={meData ? meData.me : null}
        />
    );
}
FeedItems.propTypes = {
    feedId: PropTypes.string.isRequired,
};

export default FeedItems;
