import gql from 'graphql-tag';

const MY_FEED_ITEMS_QUERY = gql`query MY_FEEDS_QUERY (
        $feedId: ID!
        $orderBy: FeedItemOrderByInput
        $skip: Int
        $after: String
        $before: String
        $first: Int
        $last: Int
    ) {
        myFeedItems (
            feedId: $feedId
            orderBy: $orderBy
            skip: $skip
            after: $after
            before: $before
            first: $first
            last: $last
        ) {
            id
            title
            description
            summary
            pubDate
            link
            guid
            imageUrl
            enclosures {
                url
                type
                length
            }
        }
    }
`;

export default MY_FEED_ITEMS_QUERY;
