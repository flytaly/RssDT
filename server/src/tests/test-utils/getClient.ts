import { GraphQLClient } from 'graphql-request';
import { RequestDocument, Variables } from 'graphql-request/dist/types';
import { Headers } from 'graphql-request/dist/types.dom';

const getTestClient = () => {
  const client = new GraphQLClient(`http://localhost:${process.env.PORT}/graphql`);

  // const originalRequest = client.request.bind(client);
  // use rawRequest to get access to cookies
  const lastHeaders: Headers[] = [];
  client.request = async <T = any, V = Variables>(document: RequestDocument, variables?: V): Promise<T> => {
    const response = await client.rawRequest(document.toString(), variables);
    lastHeaders.push(response.headers);
    return response.data;
  };

  return { client, lastHeaders };
};

export default getTestClient;
