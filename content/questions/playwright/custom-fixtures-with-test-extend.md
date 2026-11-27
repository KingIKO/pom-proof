---
title: Each event test needs its own draft. How would a Playwright fixture set that up?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd give the fixture a name and have it create a draft for the test. When the test ends, the fixture deletes the draft.
looksFor:
  - Use `test.extend` and wait for the call that gives the test the draft.
  - List the fixture named `request` as a dependency.
  - Keep data a test can change separate from setup shared by a worker.
  - Name a task that should run even when a test doesn't ask for the fixture.
trap: Putting a draft that tests can change in a worker fixture and expecting each test to get a new draft.
followUps:
  - question: When would you use an automatic fixture?
    answer: I'd use an automatic fixture for work that must happen even if the test doesn't ask for it. Collecting logs for debugging is one example.
sources:
  - label: Playwright fixture scopes, dependencies, and execution order
    url: https://playwright.dev/docs/test-fixtures
  - label: Playwright request context
    url: https://playwright.dev/docs/api/class-apirequestcontext
examples:
  - title: Give each event test an API-created draft
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test as base } from '@playwright/test';

          const test = base.extend<{ draftId: string }>({
            draftId: async ({ request }, use) => {
              const created = await request.post('/api/test/events', { data: { status: 'draft' } });
              expect(created.status()).toBe(201);
              const { id } = await created.json();
              await use(id);
              expect((await request.delete(`/api/test/events/${id}`)).status()).toBe(204);
            },
          });

          test.use({ baseURL: 'http://localhost:3000' });

          test('an unpublished event displays Draft', async ({ page, draftId }) => {
            await page.goto(`/events/${draftId}`);
            await expect(page.getByTestId('publication-status')).toHaveText('Draft');
          });
---

I'd add a fixture named `draftId` with `test.extend`, the Playwright method that adds setup to the base test. A fixture prepares something the test needs and can clean it up afterward. I'd use Playwright's `request` fixture to create the draft through the API. I'd pass the ID to `use`, the function that runs the test with that value. I'd wait for `use` to finish before deleting the draft.

I'd list `draftId` next to `page`, the browser page fixture. That shows what the test needs without making the reader look through hooks or a base class for shared setup.

I'd give each test its own draft because the test might publish it. I'd use a worker fixture for slower setup that tests in one worker process can share safely. A service client that stores no test data those tests can change is one example. Playwright runs ordinary fixtures when a test requests them.

### Example

I'd create a fresh draft through the local test API. In the browser, I'd check that its publication status says `Draft`. When the test ends, I'd have the fixture delete the draft by ID.
