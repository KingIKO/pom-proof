---
title: A parking permit stays in Draft after Submit. What should the first CI check tell you?
topic: framework-design
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: Make it clear whether the draft was created, the submit action ran, and the portal confirmed the same permit ID.
looksFor:
  - Uses the runner output to separate draft setup failure from a failed submission.
  - Keeps the permit ID and expected confirmation visible in the test.
  - Keeps the draft setup client independent of the page interactions.
  - Uses the runner directly until another permit flow needs the same helper.
trap: Designing a driver abstraction and a general-purpose command language before any test runs.
followUps:
  - question: The next change covers permit renewal. Where should its author start?
    answer: I'd point them to the submission spec as a working example. They can reuse the setup client and add the renewal interaction without changing the shared runner.
sources:
  - label: Playwright page object models
    url: https://playwright.dev/docs/pom
  - label: Playwright API testing and setup
    url: https://playwright.dev/docs/api-testing
  - label: Playwright reporting
    url: https://playwright.dev/docs/test-reporters
examples:
  - title: Submit a draft created below the UI
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test, type Page } from '@playwright/test';

          test.use({ baseURL: 'http://localhost:3000' });

          class PermitDraft {
            constructor(private readonly page: Page) {}

            async submit(id: string) {
              await this.page.goto(`/permits/${encodeURIComponent(id)}`);
              await this.page.getByRole('button', { name: 'Submit permit' }).click();
            }
          }

          test('submits a test-owned permit', async ({ request, page }) => {
            const created = await request.post('/api/test/permits', { data: { kind: 'parking' } });
            expect(created.status()).toBe(201);
            const { id } = await created.json();
            try {
              await new PermitDraft(page).submit(id);
              await expect(page.getByRole('status')).toHaveText(`Permit ${id} submitted`);
            } finally {
              expect((await request.delete(`/api/test/permits/${id}`)).ok()).toBe(true);
            }
          });
---

If the check fails, I want the report to tell me whether we ever had a draft to submit. The setup client creates the draft and returns its ID. The page object handles the user's click, and the test checks the confirmation for that same ID. Both helpers can use shared configuration; neither should depend on the test or call back into it.

I'd publish the runner's failure artifacts in CI and point the next author to the submission spec. When renewal needs setup we've already built, we can reuse that client. I wouldn't add a driver abstraction before we have a second use for it.

### Example

In a local test environment that exposes a draft setup and cleanup API, the example creates one parking draft and checks that the portal reports its submission. The test owns one draft ID and removes it afterward.
