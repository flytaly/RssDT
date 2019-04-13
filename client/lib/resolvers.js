import ME_QUERY from '../queries/me-query';

const resolvers = {
    Mutation: {
        logOut: (_root, variables, { cache }) => {
            document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            cache.writeQuery({ query: ME_QUERY, data: { me: null } });

            return null;
        },
    },
};
export default resolvers;
