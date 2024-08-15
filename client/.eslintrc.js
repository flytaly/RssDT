module.exports = {
  plugins: ['import', '@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
  ],
  settings: {
    next: {
      rootDir: 'src',
    },
  },
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['**/gql/generated.ts'],
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
