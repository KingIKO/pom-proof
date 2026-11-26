import { defineConfig, devices } from '@playwright/test';

// Port 4405 belongs to the test suites part (Phase 1 brief). Preview serves the real build, never dev.
// Time budget: the whole run, build included, under 3 minutes on the 16-core desktop at the default
// 8 workers; each test under 10 s except the Python ones, which may load Pyodide twice (about 10 s
// measured 2026-11-26 on a fully loaded machine). Unit tests stay under 1 s each.
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
    // --ignore-lock: Astro 7 refuses a second preview in one project (other parts preview their own
    // builds here) and, when it detects an agent, moves preview to the background, where Playwright
    // would lose the process. The flag keeps this server in the foreground beside the others.
    command: `npx astro build && npx astro preview --port ${port} --ignore-lock`,
    url: baseURL,
    // Always build fresh: five parts share this checkout, so a running preview may be stale.
    reuseExistingServer: false,
    // Default 60 s start timeout kept: the build measured 3.5 s on 2026-11-26 (16-core desktop, other agents active).
  },
});
