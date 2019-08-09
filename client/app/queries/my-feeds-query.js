import gql from 'graphql-tag';

const MY_FEEDS_QUERY = gql`
    query MY_FEEDS_QUERY {
        myFeeds {
            id
            feed {
                id
                url
                link
                title
                imageUrl
                imageTitle
            }
            schedule
            lastUpdate
            createdAt
            activated
            withContentTable
        }
    }
`;

export default MY_FEEDS_QUERY;
