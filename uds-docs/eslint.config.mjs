// Flat ESLint config for the UDS Docs Next.js app.
//
// Pre-migration `npm run lint` was wired to `next lint`, which is
// interactive in Next 15 (asks the user to pick Strict / Base / Cancel)
// and was dropped entirely in Next 16. We replace it with a direct ESLint
// CLI invocation against `eslint-config-next`'s flat config so the lint
// command is fully non-interactive and reproducible in CI.
//
// `eslint-config-next` ≥ 16 ships a flat-config array — spread it
// directly. The project-specific overrides below:
//   - `@next/next/no-html-link-for-pages` off: we use plain <a> for
//     internal cross-page navigation (internal-href.ts preserves ?uds=
//     and intentionally bypasses Next's <Link>)
//   - unused vars/args starting with `_` are allowed
//
// Ignored paths cover everything that isn't first-party Next code:
// generated payload (`uds/`, `versions/`), copied assets (`public/`),
// build output (`.next/`, `out/`), and the long site-changelog data file
// where lint noise doesn't add value.

import nextConfig from 'eslint-config-next';
import tseslint from 'typescript-eslint';

export default [
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // The two rules below come from the React 19 hooks plugin. They flag
      // idiomatic patterns the codebase uses extensively — resetting state
      // in an effect when an upstream prop changes (`setData(null)` then
      // refetch), and reading a ref's `.current` during render to feed a
      // memo. Both have stronger alternatives (`key` remount / `useMemo`
      // over a state-backed list), but the refactor is out of scope for
      // the migration-review cleanup. Downgrade to warning so they're
      // visible in `npm run lint` output but don't fail CI yet. Promote
      // back to errors once the patterns are refactored.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'uds/**',
      'versions/**',
      'public/**',
      'data/site-changelog.ts',
      'next.config.ts',
      'next-env.d.ts',
    ],
  },
];
