---
title: Why can a visible Playwright button still time out on click?
topic: locators-waits
roles: [automation, sdet]
level: junior
type: tooling
oneLine: A visible button may still be moving, disabled, or covered, so inspect the check that kept the click from happening.
looksFor:
  - A single matching element
  - Visibility, stability, enabled state, receiving events, and not being inert
  - A reason a real user would also be blocked
  - A useful alternative to a sleep or forced click
trap: Forcing the click before finding out whether a loading overlay blocks users too.
followUps:
  - question: Is a successful click proof that the form saved?
    answer: No. I would check a user-facing confirmation or the resulting saved state after the click.
  - question: What if the app has no visible signal that a background action finished?
    answer: I can start waiting for the matching response before the action, or use expect.poll in Playwright Test to observe a value until it reaches the expected state.
sources:
  - label: Playwright actionability
    url: https://playwright.dev/docs/actionability
  - label: Playwright polling assertions
    url: https://playwright.dev/docs/test-assertions#expectpoll
  - label: Playwright response waits
    url: https://playwright.dev/docs/api/class-page#page-wait-for-response
  - label: Playwright Python response waits
    url: https://playwright.dev/python/docs/api/class-page#page-wait-for-response
  - label: Playwright response properties
    url: https://playwright.dev/docs/api/class-response
  - label: Playwright Python response properties
    url: https://playwright.dev/python/docs/api/class-response
examples:
  - title: Wait for the rate lookup triggered by the click
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('loads the quoted shipping rate', async ({ page }) => {
            await page.goto('http://localhost:3000/checkout/shipping');
            const responsePromise = page.waitForResponse((r) =>
              new URL(r.url()).pathname === '/api/rates' && r.request().method() === 'POST');
            await page.getByRole('button', { name: 'Get rate' }).click();
            const response = await responsePromise;
            expect(response.status()).toBe(200);
            expect(await response.json()).toMatchObject({ cents: 750 });
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from urllib.parse import urlsplit

          def test_shipping_rate(page):
              page.goto("http://localhost:3000/checkout/shipping")
              with page.expect_response(
                  lambda result: urlsplit(result.url).path == "/api/rates"
                  and result.request.method == "POST"
              ) as event:
                  page.get_by_role("button", name="Get rate").click()
              assert event.value.status == 200
              assert event.value.json()["cents"] == 750
---

For `locator.click()`, Playwright waits for a single match that is visible, stable, enabled, outside an inert subtree, and able to receive events at the click point. A button can be painted on the screen but sit behind a spinner that intercepts the click. Other actions have their own set of checks, so I'd look at the call log for the actual action that timed out.

I find what the user is waiting for and decide whether it should have happened. If the overlay is stuck because a request failed, I want the failure to point there. Forcing the click can bypass checks that were telling me about the bug.

### Example

On a shipping form, I'd inspect the pending rate lookup and look for the chosen delivery option. Once a normal click works, I'd still assert the updated order summary before calling the test a pass.

In the local fixture, a shipping address is already entered. The example watches the POST made by Get rate and expects a quote of 750 cents. That check isolates the lookup; the summary needs its own assertion.
