import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run only the lib/ unit-test suites for now — these are pure-data
    // modules with no DOM or React. Vitest can opt into jsdom per-test
    // later via the @vitest/web-worker / `// @vitest-environment jsdom`
    // pragma when a component-level test arrives.
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
