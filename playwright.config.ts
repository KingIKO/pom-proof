import { defineConfig, devices } from '@playwright/test';

// Port 4405 belongs to the test suites part (Phase 1 brief). Preview serves the real build, never dev.
const port = 4405;
const baseURL = `http://localhost:${port}/pom-proof/`;
const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci
    ? [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]]
    : [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL,
    trace: ci ? 'off' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx astro build && npx astro preview --port ${port}`,
    url: baseURL,
    // Always build fresh: five parts share this checkout, so a running preview may be stale.
    reuseExistingServer: false,
    // Default 60 s start timeout kept: the build measured 3.5 s on 2026-11-26 (16-core desktop, other agents active).
  },
});
