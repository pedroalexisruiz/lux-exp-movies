import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ['dotenv/config', './test/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: ['test/**', 'node_modules/**', 'dist/**', '**/*.d.ts'],
    },
    projects: [
      {
        extends: true,
        test: {
          include: ['test/client/**'],
          name: 'client',
          environment: 'jsdom',
        },
      },
      {
        extends: true,
        test: {
          include: ['test/server/**'],
          name: 'server',
          environment: 'node',
        },
      },
    ],
  },
});
