import type { DiagnoseItem } from '../../types';

const item: DiagnoseItem = {
  id: 'playwright-render-race',
  title: 'Diagnose a slow report render',
  kind: 'diagnose',
  difficulty: 'Easy',
  topics: ['Playwright', 'Flaky tests', 'Asynchronous UI'],
  roles: ['automation', 'sdet'],
  summary: 'Identify why a report test fails even though its locator and network request work.',
  prompt: 'A portal generates reports on demand. The test sometimes fails on a busy worker. Use the snippet and trace excerpts to identify the root cause and pick a fix that keeps the test sensitive to a real missing report.',
  lang: 'typescript',
  code: `
import { test, expect } from '@playwright/test';

test('renders the monthly report', async ({ page }) => {
  await page.goto('/reports');
  await page.getByRole('button', { name: 'Generate' }).click();
  await page.waitForTimeout(400);
  const heading = page.getByRole('heading', { name: 'Monthly report' });
  expect(await heading.isVisible()).toBe(true);
});`,
  log: `[fast worker, from start] 0 ms: click, 185 ms: response 200, 240 ms: heading attached
[slow worker, from start] 0 ms: click, 405 ms: assertion failed
Error: expect(received).toBe(expected)
Expected: true
Received: false
[slow worker, application trace] 690 ms: response 200, 760 ms: same heading attached`,
  questions: [
    {
      prompt: 'What causes the intermittent failure?',
      options: [
        { text: 'The role lookup always targets the page’s main heading.', why: 'The name filters the heading lookup, and the trace shows the expected heading on both workers.' },
        { text: 'The fixed delay ends before async report rendering, and isVisible checks the current state.', correct: true, why: 'The slow trace places the assertion at 405 ms and the heading at 760 ms. The boolean check takes a snapshot.' },
        { text: 'The click sometimes submits the report twice.', why: 'The trace shows one click and one successful response. A double submission would require evidence of a second request.' },
        { text: 'The test imports expect from the wrong package.', why: 'The import is from the Playwright test runner, which reports the failed assertion as expected.' },
      ],
    },
    {
      prompt: 'Which fix keeps the intended assertion?',
      options: [
        { text: 'Raise the fixed delay to 800 ms.', why: 'A slower worker can still exceed a larger delay, and every fast run pays for the extra time.' },
        { text: 'Wait for any response with status 200.', why: 'Unrelated requests can return 200, and even the report response can finish before the heading renders.' },
        { text: 'Remove the assertion and keep the click.', why: 'A successful click does not prove that the report appeared.' },
        { text: 'Remove the fixed delay and await expect(heading).toBeVisible().', correct: true, why: 'The locator assertion retries until the named heading becomes visible or the assertion timeout expires.' },
      ],
    },
  ],
  hints: ['Compare the timestamp of the assertion with the heading’s arrival.', 'Check which operation retries: the locator assertion or an assertion against a boolean.'],
  solutionNotes: 'The test samples visibility before the slow render completes. A web-first assertion waits for the heading itself and retains a useful failure if the report never appears.',
  interviewNotes: 'Name the user-visible condition that signals readiness. Explain why a successful response alone would not prove the report rendered.',
  sources: [
    { label: 'Playwright: Auto-retrying assertions', url: 'https://playwright.dev/docs/test-assertions#auto-retrying-assertions' },
    { label: 'Playwright: Locator.isVisible()', url: 'https://playwright.dev/docs/api/class-locator#locator-is-visible' },
  ],
};

export default item;
