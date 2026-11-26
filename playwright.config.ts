import { defineConfig, devices } from '@playwright/test';

const PORT = 5190;
// Same default as vite.config.ts.
const BASE_PATH = process.env.BASE_PATH ?? '/pom-proof/';
const BASE_URL = `http://localhost:${PORT}${BASE_PATH}`;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    // Traces record everything typed; keep them out of CI artifacts.
    trace: CI ? 'off' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --config tests/e2e/vite.e2e.config.ts --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
