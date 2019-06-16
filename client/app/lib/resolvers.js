const resolvers = {
    Mutation: {
        logOut: async (_root, variables, { client }) => {
            document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            await client.resetStore();
            return null;
        },
    },
};
export default resolvers;
