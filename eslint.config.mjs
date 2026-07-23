import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.min.js',
      'build/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: globals.node,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },

    rules: {
      /**
       * ==========================================
       * Imports inutilisés
       * ==========================================
       */

      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off', // Prevent duplicate with unused-imports/no-unused-imports
      'unused-imports/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      /**
       * ==========================================
       * Imports dupliqués
       * ==========================================
       */

      'import/no-duplicates': 'error',

      /**
       * ==========================================
       * Organisation des imports
       * ==========================================
       */

      'import/order': [
        'error',
        {
          groups: [
            'builtin', // node:fs, path...
            'external', // express, zod...
            'internal', // @/...
            'parent', // ../...
            'sibling', // ./...
            'index',
            'type',
          ],

          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],

          pathGroupsExcludedImportTypes: ['builtin'],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },

          'newlines-between': 'always',
        },
      ],
      'import/newline-after-import': 'error',
    },
  },
];
