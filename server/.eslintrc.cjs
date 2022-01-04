module.exports = {
  extends: ['airbnb-typescript/base', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugin: ["modules"],
  ignorePatterns: ['**/graphql/generated.ts', 'src/migrations/**/*.ts'],

  rules: {
    'no-console': 'off',
    'no-plusplus': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-mutable-exports': 'off',
    'import/extensions': ['error', 'ignorePackages'],
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
