import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { ASTNode } from 'graphql';
import { print } from 'graphql';
import { GraphQLClient, RequestDocument, Variables, RequestOptions } from 'graphql-request';
import { VariablesAndRequestHeadersArgs } from 'graphql-request/build/esm/types';

const getTestClient = () => {
  const client = new GraphQLClient(`http://localhost:${process.env.PORT}/graphql`);

  // use rawRequest to get access to cookies
  const lastHeaders: Headers[] = [];

  client.request = async <T, V extends Variables = Variables>(
    documentOrOptions: RequestDocument | TypedDocumentNode<T, V> | RequestOptions<V>,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> => {
    const [vars, headers] = variablesAndRequestHeaders;
    const doc = documentOrOptions as RequestDocument;
    const response = await client.rawRequest<T>(print(doc as ASTNode), vars, headers);
    lastHeaders.push(response.headers);
    return response.data;
  };

  return { client, lastHeaders };
};

export default getTestClient;
