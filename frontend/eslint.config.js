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
      // eslint-plugin-react-hooks 7 added React Compiler rules. They flag real patterns to clean up one
      // component at a time (setState in an effect, mutating a value during render), so they report as
      // warnings here instead of blocking the lint that the ESLint 10 upgrade needs to stay green.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
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
