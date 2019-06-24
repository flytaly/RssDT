import gql from 'graphql-tag';
import { feedItemFields } from './my-feed-items-query';

const MY_FEED_ITEMS_CONNECTION = gql`query FEED_ITEM_CONNECTION(
        $feedId: ID!
        $orderBy: FeedItemOrderByInput
        $skip: Int
        $after: String
        $before: String
        $first: Int
        $last: Int
    ){
        myFeedItemsConnection(
            feedId: $feedId
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
            edges {
                node {
                    ...feedItemFields
                }
            }
            pageInfo {
                hasNextPage
            }
        }
}
    ${feedItemFields}
`;

export default MY_FEED_ITEMS_CONNECTION;
