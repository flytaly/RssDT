// overwrite: true
// schema: 'http://localhost:4000/graphql'
// documents: 'src/tests/graphql/**/*.graphql'
// emitLegacyCommonJSImports: false,
// generates:
//   src/tests/graphql/generated.ts:
//     plugins:
//       - typescript
//       - typescript-operations
//       - typescript-graphql-request
//     hooks:
//       afterOneFileWrite: sed -i '' "s/import gql from 'graphql-tag'/import { gql } from 'graphql-tag'/"
//
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['src/tests/graphql/**/*.graphql'],
  generates: {
    'src/tests/graphql/generated.ts': {
      plugins: [
        'typescript', //
        'typescript-operations',
        'typescript-graphql-request',
      ],
    },
  },
  hooks: {
    // fix for esm imports
    // https://github.com/apollographql/graphql-tag/issues/804#issuecomment-2059858346
    afterAllFileWrite: [
      `sed -i "s/import gql from 'graphql-tag'/import { gql } from 'graphql-tag'/"`,
    ],
  },
};

export default config;
