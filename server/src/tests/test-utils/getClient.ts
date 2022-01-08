import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import type { ASTNode } from 'graphql';
import { Headers } from 'graphql-request/dist/types.dom';

const getTestClient = () => {
  const client = new GraphQLClient(`http://localhost:${process.env.PORT}/graphql`);

  // use rawRequest to get access to cookies
  const lastHeaders: Headers[] = [];
  client.request = async (doc, vars, headers) => {
    const response = await client.rawRequest(print(doc as ASTNode), vars, headers);
    lastHeaders.push(response.headers);
    return response.data;
  };

  return { client, lastHeaders };
};

export default getTestClient;
