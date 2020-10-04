module.exports = {
    extends: ['airbnb-typescript/base', 'prettier', 'prettier/@typescript-eslint'],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        'no-console': 'off',
        'no-plusplus': 'off',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
    },
};
