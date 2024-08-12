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
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
);
