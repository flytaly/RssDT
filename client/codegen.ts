import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:4000/graphql',
  documents: 'src/graphql/**/*.graphql',
  generates: {
    'src/gql/generated.ts': {
      /* preset: 'client', */
      plugins: [
        'typescript', //
        'typescript-operations',
        'typescript-graphql-request',
      ],
    },
  },
};

export default config;
