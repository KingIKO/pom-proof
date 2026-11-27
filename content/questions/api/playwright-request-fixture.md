---
title: "How would you test an API in Playwright without opening a browser page?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd use Playwright Test's request fixture with a separate test identity. I'd check the reply and read back anything the request saves."
looksFor:
  - "Send requests through the request fixture instead of opening a browser page."
  - "Get the target and credentials from test settings rather than putting them in the test body."
  - "Check the exact status and the data that matters."
  - "Use separate records or clean them up reliably."
trap: "Using only response.ok() when the API promises an exact status and a particular record."
followUps:
  - question: "When would you use page.request instead?"
    answer: "I'd use it if the request needs to share cookies with the browser session. An example is reading a change the test made in that session."
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

I'd use the `request` fixture that Playwright Test provides to send HTTP requests directly. It uses test settings such as `baseURL`, the starting address for relative paths. I'd get credentials from the test environment and keep the request data next to the checks. If the request writes data, I'd check the exact status the API promises. I'd make a separate request to read the saved record.

### Example

With `baseURL` and the account set in Playwright settings, I'd call `request.post('/labels', { data: { name } })`. I'd use a dedicated account that resets for every run. I'd check `201` and read the ID with `await response.json()`. I'd use `request.get` to check `200` and the saved name.
