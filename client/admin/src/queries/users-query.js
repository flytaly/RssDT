import gql from 'graphql-tag';

const USERS_QUERY = gql`
    query USERS_QUERY {
        users {
            id
            email
            feeds {
                id
                schedule
                lastUpdate
                createdAt
                activated
                feed {
                    title
                    url
                }
            }
            permissions
            locale
            timeZone
            createdAt
            dailyDigestHour
            shareEnable
            filterShare
        }
    }
`;

export default USERS_QUERY;
