module.exports = {
    extends: ['airbnb-typescript', 'prettier', 'prettier/@typescript-eslint'],
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['jest'],
    env: {
        'jest/globals': true,
    },
    rules: {
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
        'react/react-in-jsx-scope': 'off',
        radix: 'off',
    },
};
