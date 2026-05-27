import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run only the lib/ unit-test suites for now — these are pure-data
    // modules with no DOM or React. Web Component package tests use
    // an inline happy-dom directive because Lit needs a browser-like
    // custom-elements registry.
    include: ['lib/**/*.test.ts', 'packages/**/*.test.ts'],
    environment: 'node',
  },
});
