import { default as eslint } from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts'],
  },
  {
    ignores: ['**/graphql/generated.ts', 'src/migrations/**/*.ts'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // 'no-console': 'off',
      // 'no-plusplus': 'off',
      // 'import/prefer-default-export': 'off',
      // 'import/no-extraneous-dependencies': 'off',
      // 'import/no-mutable-exports': 'off',
      // 'import/extensions': 'off',
      // 'class-methods-use-this': 'off',
      // 'no-underscore-dangle': 'off',
      // 'no-param-reassign': 'off',
      // 'no-restricted-syntax': 'off',
      // 'max-classes-per-file': 'off',
      // 'arrow-body-style': 'off',
      // 'import/no-cycle': 'off',
      // radix: 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
);
