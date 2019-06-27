import gql from 'graphql-tag';

const FEEDS_QUERY = gql`
    query FEEDS_QUERY (
        $where: FeedWhereInput
        $orderBy: FeedOrderByInput
        $skip: Int
        $after: String
        $before: String
        $first: Int
        $last: Int
    ) {
        feeds (
            where: $where
            orderBy: $orderBy
            skip: $skip
            after: $after
            before: $before
            first: $first
            last: $last
        ) {
            id
            url
            link
            title
            description
            activated
            language
            imageUrl
            imageTitle
            userFeeds {
                id
                schedule
                activated
                user {
                    id
                    email
                }
            }
            itemsCount
            lastSuccessful
            createdAt
            updatedAt
        }
    }
`;

export default FEEDS_QUERY;
