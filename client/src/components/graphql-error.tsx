import React from 'react';

interface GraphQLErrorProps {
  error: string;
}

const GraphQLError = ({ error }: GraphQLErrorProps) => <>{error.replace(/^GraphQL error:/, '')}</>;

export default GraphQLError;
