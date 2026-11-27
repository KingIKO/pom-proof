---
title: Several event tests need their own draft. How would you make that a Playwright fixture?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Define a named fixture that creates the draft, passes it to the test, and cleans it up when the test ends.
looksFor:
  - Uses test.extend and awaits the call that provides the resource.
  - Declares a dependency on the request fixture.
  - Separates per-test writes from worker-scoped setup.
  - Explains when an automatic fixture is appropriate.
trap: Putting a mutable draft in a worker fixture and assuming every test gets a new one.
followUps:
  - question: When would you use an automatic fixture?
    answer: I'd use one for a concern like collecting diagnostic evidence, where the fixture must run even when the test doesn't list it.
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

I'd extend the base test with a fixture named `draftId`. It depends on the runner's `request` fixture. It creates the resource before calling `use` and deletes it afterward. The test lists its dependency next to `page`, so a reader can see what it needs without tracing through hooks or a base class.

I'd make the draft test-scoped because a test may publish it. A worker fixture can share slower setup that is safe within a worker, such as a service client with no mutable test data. Ordinary fixtures are requested as needed. An automatic fixture runs even when the test doesn't ask for it.

### Example

The local test API creates a fresh draft. The browser checks that its publication status says `Draft`, and the fixture removes that draft by ID.
