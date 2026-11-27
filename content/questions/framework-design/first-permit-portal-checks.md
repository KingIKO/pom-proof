---
title: "A parking permit stays in Draft after you submit it. What should the first automated check tell you?"
topic: framework-design
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: "I want to know whether the test created a draft and submitted it. I check if the portal confirmed the same permit ID."
looksFor:
  - "Use the report to separate a draft setup failure from a failed submission."
  - "Keep the draft ID and expected confirmation easy to find in the test."
  - "Keep the code that creates drafts separate from the code that uses the page."
  - "Use the runner directly until another permit flow needs the same helper."
trap: "Designing a general browser driver and command language before you have a working test."
followUps:
  - question: "When someone adds coverage for permit renewal, where should they start?"
    answer: "I'd show them the submission test as a working example. They can reuse the code that sets up a draft and add renewal steps without changing the runner."
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

If the test fails, I want its report to show whether there was a draft to submit. I use a setup client, code that calls a service, to create the draft and get its ID. I use a page object, a helper for screen actions, to click Submit. In the test itself, I check the confirmation for that same ID.

The two helpers can read the same settings. I'd keep both independent of the test so neither has to call it. I'd publish the runner's failure files in continuous integration (CI) and show a new author the submission test. If renewal needs the same setup, I'd reuse the client. I'd wait for a second use before wrapping the browser driver in another helper.

### Example

If my local test environment has an API for setting up and removing drafts, I'd use it to create one parking draft. I'd check that the portal confirms submission. I'd keep that one draft ID in the test and remove the draft afterward.
