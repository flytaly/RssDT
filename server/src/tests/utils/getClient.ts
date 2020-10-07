// eslint-disable-next-line import/no-extraneous-dependencies
import { GraphQLClient } from 'graphql-request';

const getTestClient = () => new GraphQLClient(`http://localhost:${process.env.PORT}/graphql`);

export default getTestClient;
