import React from 'react';

interface GraphQLErrorProps {
  error: string;
}

const GraphQLError: React.FC<GraphQLErrorProps> = ({ error }) => (
  <>{error.replace(/^GraphQL error:/, '')}</>
);

export default GraphQLError;
