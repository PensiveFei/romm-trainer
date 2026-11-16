import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['build/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-irregular-whitespace': ['error', { skipComments: true }]
    }
  },
  {
    files: ['dist/src/**/*.js'],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ['functions/**/*.js'],
    languageOptions: { globals: globals.serviceworker },
    // Resolver errors intentionally expose sanitized reasons rather than URLs.
    rules: { 'preserve-caught-error': 'off' }
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  },
  {
    files: ['tests/app-pause.test.js'],
    languageOptions: { globals: { testAudio: 'readonly' } }
  }
];
