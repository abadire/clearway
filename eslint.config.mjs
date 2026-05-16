import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  {
    files: ['src/**/*.ts'],
    ignores: ['graphql/generated.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.eslintRecommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off', // Allow dumb components
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'public-static-field',
            'private-static-field',
            'public-decorated-field',
            'private-decorated-field',
            'private-instance-field',
            'public-instance-field',
            'public-get',
            'protected-get',
            'private-get',
            'constructor',
            'public-static-method',
            'protected-static-method',
            'private-static-method',
            'public-decorated-method',
            'protected-decorated-method',
            'private-decorated-method',
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
          ],
        },
      ],
      'lines-between-class-members': 'error',
      'no-console': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
      '@angular-eslint/template/button-has-type': 'error',
    },
  },
  {
    files: ['eslint.config.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
