import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Complexity/size quality gate. Core ESLint rules only (no new plugins).
    // Phase 0 = current worst value (green now); ratchet over time — see
    // obt/.claude/quality-gates-plan.md.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', { max: 24 }], // ratchet -> 15 -> 10
      'max-depth': ['error', 4],
      'max-params': ['error', 4],
      'max-lines-per-function': ['error', { max: 389, skipBlankLines: true, skipComments: true }], // ratchet -> 250 -> 150
      'max-lines': ['error', { max: 641, skipBlankLines: true, skipComments: true }], // ratchet -> 400 -> 300
    },
  },
])
