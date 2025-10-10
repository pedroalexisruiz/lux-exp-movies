import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    coverage: { reporter: ['text', 'html'] },
    environmentMatchGlobs: [['**/?(*.)+(spec|test).{tsx,jsx}', 'jsdom']],
  },
});
