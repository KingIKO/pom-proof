import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tests/content holds the file-only content checks; its *.spec.ts files are Playwright's.
  test: { include: ['tests/unit/**/*.test.ts', 'tests/content/**/*.test.ts'] },
});
