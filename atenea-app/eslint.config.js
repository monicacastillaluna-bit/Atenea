import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['web/dist', 'node_modules', 'data'] },
  js.configs.recommended,
  {
    files: ['server/**/*.js', 'test/**/*.js', '*.js', 'web/vite.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
  },
  {
    files: ['web/src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Sin el plugin de React, marcar las variables usadas solo en JSX como usadas.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]' }],
    },
  },
];
