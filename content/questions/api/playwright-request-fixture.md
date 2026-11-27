---
title: "How would you write a Playwright API test without opening a browser page?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "Use Playwright Test's built-in request fixture with an isolated test identity, then assert the response and read back the result."
looksFor:
  - "Uses the request fixture rather than a UI navigation."
  - "Keeps environment and credentials out of the test body."
  - "Uses an exact status and meaningful data assertions."
  - "Uses independent data or reliable cleanup."
trap: "Checking response.ok() alone on an endpoint that promises a particular resource and status."
followUps:
  - question: "When might you use page.request instead?"
    answer: "When I want the request to share cookies with that page's browser context, such as reading back a change made with that session."
sources:
  - label: "Playwright, API testing"
    url: https://playwright.dev/docs/api-testing
  - label: Playwright APIRequestContext, POST and GET
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
examples:
  - title: Create and read back a label without a page
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('the saved label has the name I sent', async ({ request }) => {
            const name = 'Fragile supplies';
            const response = await request.post('/labels', { data: { name } });
            expect(response.status()).toBe(201);
            const { id } = await response.json();
            expect(id).toEqual(expect.any(String));

            const saved = await request.get(`/labels/${id}`);
            expect(saved.status()).toBe(200);
            expect(await saved.json()).toMatchObject({ id, name });
          });
---

I'd take `request` from the test function's fixtures. It sends requests directly and uses Playwright Test configuration such as `baseURL`. I'd provide credentials from the test environment and keep the payload beside the assertions. For a write I'd check the exact status from our contract and verify the resulting resource using a separate read.

### Example

With `baseURL` and the test identity set in Playwright configuration, I'd call `request.post('/labels', { data: { name } })` in a dedicated account reset for each run. I'd check `201`, read the ID from `await response.json()`, and use `request.get` to check `200` and the saved name.
