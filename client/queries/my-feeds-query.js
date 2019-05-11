import gql from 'graphql-tag';

const MY_FEEDS_QUERY = gql`
    query MY_FEEDS_QUERY {
        myFeeds {
            id
            feed {
                url
                link
                title
                imageUrl
                imageTitle
            }
            schedule
            lastUpdate
            createdAt
        }
    }
`;

export default MY_FEEDS_QUERY;
