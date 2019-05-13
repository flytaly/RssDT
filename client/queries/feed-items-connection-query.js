import gql from 'graphql-tag';

const FEED_ITEMS_CONNECTION = gql`query FEED_ITEM_CONNECTION(
        $feedId: ID!
        $orderBy: FeedItemOrderByInput
        $skip: Int
        $after: String
        $before: String
        $first: Int
        $last: Int
    ){
        feedItemsConnection(
            where: { feed: { id: $feedId } }
            orderBy: $orderBy
            skip: $skip
            after: $after
            before: $before
            first: $first
            last: $last
        ){
            aggregate {
                count
            }
            pageInfo {
                hasNextPage
            }
        }
}`;

export default FEED_ITEMS_CONNECTION;
