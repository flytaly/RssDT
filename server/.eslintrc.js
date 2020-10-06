module.exports = {
    extends: ['airbnb-typescript/base', 'prettier', 'prettier/@typescript-eslint'],
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['jest'],
    env: {
        'jest/globals': true,
    },
    rules: {
        'no-console': 'off',
        'no-plusplus': 'off',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        'no-underscore-dangle': 'off',
    },
};
