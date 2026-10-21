import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Without eslint-plugin-react, JSX usage (<motion.div>, <Icon />) is invisible to
      // no-unused-vars, so names used only in JSX are exempted by pattern.
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^(motion|[A-Z_])',
        argsIgnorePattern: '^[A-Z_]',
      }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // The Tailwind config is CommonJS (module.exports / require), not an ES module.
    files: ['tailwind.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
      parserOptions: { sourceType: 'commonjs' },
    },
  },
]
