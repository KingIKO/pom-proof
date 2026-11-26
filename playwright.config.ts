import { defineConfig, devices } from '@playwright/test';

const origin = 'http://127.0.0.1:4327';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: origin },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4327',
    url: `${origin}/pom-proof/`,
    reuseExistingServer: false,
  },
});
