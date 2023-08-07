module.exports = {
  extends: ['eslint-config-next', 'prettier'],
  ignorePatterns: ['**/generated/graphql.ts'],
  rules: {
    '@next/next/no-img-element': 'off',

    radix: 'off',
  },
};
