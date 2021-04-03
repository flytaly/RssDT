module.exports = {
  extends: ['airbnb-typescript/base', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['jest'],
  env: {
    'jest/globals': true,
  },
  ignorePatterns: ['**/graphql/generated.ts', 'src/migrations/**/*.ts'],

  rules: {
    'no-console': 'off',
    'no-plusplus': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',

    //  Doesn't work with custom TS path and Node import mapping like '#entities'
    'import/extensions': ['error', 'never' /*'ignorePackages'*/],
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'max-classes-per-file': 'off',
    'arrow-body-style': 'off',
    'import/no-cycle': 'off',
    radix: 'off',
  },
};
