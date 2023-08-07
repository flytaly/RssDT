module.exports = {
  plugins: [, 'import'],
  extends: [
    'eslint-config-next',
    'prettier',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['**/generated/graphql.ts'],
  rules: {
    '@next/next/no-img-element': 'off',

    radix: 'off',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal', // <- Absolute imports
          ['sibling', 'parent'],
          'index',
          'unknown',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
};
