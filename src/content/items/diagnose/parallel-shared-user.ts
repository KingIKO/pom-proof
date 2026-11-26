import type { DiagnoseItem } from '../../types';

const item: DiagnoseItem = {
  id: 'parallel-shared-user',
  title: 'Diagnose workers sharing a test user',
  kind: 'diagnose',
  difficulty: 'Medium',
  topics: ['Parallel tests', 'Test isolation', 'Playwright'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Explain why separate browser contexts do not make a shared account safe to mutate.',
  prompt: 'Two notification-settings tests pass separately. CI runs them with Playwright’s `fullyParallel` setting against one test service. Both browser contexts start from the same saved test-user state. Explain the failure and choose a fix that preserves parallel execution.',
  lang: 'typescript',
  code: `
import { test, expect } from '@playwright/test';

test.use({ storageState: 'fixtures/member-state.json' });

test('persists email notices on', async ({ request }) => {
  await request.put('/api/preferences', { data: { emailNotices: true } });
  const read = await request.get('/api/preferences');
  expect((await read.json()).emailNotices).toBe(true);
});

test('persists email notices off', async ({ request }) => {
  await request.put('/api/preferences', { data: { emailNotices: false } });
  const read = await request.get('/api/preferences');
  expect((await read.json()).emailNotices).toBe(false);
});`,
  log: `12:08:06.022 worker 0 PUT /api/preferences user=qa-member emailNotices=true 200
12:08:06.045 worker 1 PUT /api/preferences user=qa-member emailNotices=false 200
12:08:06.061 worker 0 GET /api/preferences user=qa-member emailNotices=false 200
12:08:06.078 worker 1 GET /api/preferences user=qa-member emailNotices=false 200
worker 0: Expected true, received false`,
  questions: [
    {
      prompt: 'What made the first assertion fail?',
      options: [
        { text: 'The saved-state file forces both workers into the same browser context.', why: 'Each test can have its own context while authenticating as the same test account.' },
        { text: 'The preferences service caches all GET responses.', why: 'The write order explains the read, and the logs provide no evidence of a cached response.' },
        { text: 'The boolean value was serialized as text.', why: 'The observed value is false and matches the second completed write.' },
        { text: 'Both workers write one account’s preferences, so the second write wins before the first read.', correct: true, why: 'The user identifier is identical and the second PUT lands between worker 0’s PUT and GET.' },
      ],
    },
    {
      prompt: 'What fixes the underlying test dependency?',
      options: [
        { text: 'Retry the assertion until the desired preference returns.', why: 'A retry can obscure contention, and no action changes the shared preference back to true.' },
        { text: 'Provision and authenticate separate test users per test and clean up their data.', correct: true, why: 'The reads and writes then address distinct records even if the tests run at the same time.' },
        { text: 'Share a browser context so the state syncs faster.', why: 'This would add browser state sharing while both requests still target the same server record.' },
        { text: 'Move one test later or disable parallelism for the entire suite.', why: 'Serial execution can mask this overlap, but it does not remove the dependency or preserve parallel execution.' },
      ],
    },
  ],
  hints: ['Group the log by user identifier as well as worker.', 'Look for a write that falls between the other test’s write and read.'],
  solutionNotes: 'Allocate distinct accounts and authenticate separately. Use fixtures to seed what each test needs and clean up those accounts. Confirm the test pair still passes with overlapping execution.',
  interviewNotes: 'Explain which state a browser context isolates, then list examples of shared server state that need their own test data strategy.',
  sources: [
    { label: 'Playwright: Authentication when tests modify server-side state', url: 'https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker' },
    { label: 'Playwright: Browser contexts for test isolation', url: 'https://playwright.dev/docs/browser-contexts' },
  ],
};

export default item;
