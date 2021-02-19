module.exports = {
  extends: ['airbnb-typescript', 'prettier', 'prettier/@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['jest', 'react-hooks'],
  env: {
    'jest/globals': true,
  },
  ignorePatterns: ['**/generated/graphql.ts'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'arrow-body-style': 'off',
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'max-classes-per-file': 'off',
    'no-console': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-one-expression-per-line': 'off',

    // next.js automatically adds anchors in Link components
    'jsx-a11y/anchor-is-valid': 'off',

    'jsx-a11y/label-has-associated-control': 'off',
    radix: 'off',
    'react/jsx-wrap-multilines': [
      1,
      {
        declaration: 'parens',
        assignment: 'parens',
        return: 'parens',
        arrow: 'parens',
        condition: 'parens',
        logical: 'ignore',
        prop: 'ignore',
      },
    ],
  },
};
