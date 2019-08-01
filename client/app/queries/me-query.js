import gql from 'graphql-tag';

export const meFields = gql`
    fragment meFields on User {
            id
            email
            timeZone
            locale
            dailyDigestHour
            shareEnable
            filterShare
}`;

const ME_QUERY = gql`
    query ME_QUERY {
        me {
            ...meFields
        }
    }
    ${meFields}
`;

export default ME_QUERY;
