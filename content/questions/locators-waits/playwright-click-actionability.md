---
title: Why might Playwright run out of time trying to click a button that's already visible?
topic: locators-waits
roles: [automation, sdet]
level: junior
type: tooling
oneLine: A visible button may still be moving, disabled, or covered. I inspect the check that kept the click from happening.
looksFor:
  - Explain that the locator must match a single element.
  - "Name the checks: visible, stable, enabled, able to receive events, and not inert."
  - Give a reason a real user would also be blocked.
  - Offer a useful alternative to a sleep or a forced click.
trap: Forcing Playwright to click before checking whether a loading layer also stops users from clicking.
followUps:
  - question: If the click succeeds, can you conclude that the app saved the form?
    answer: No. After the click, I would check a confirmation the user sees or the resulting saved state.
  - question: What would you check if nothing on the page shows that the background action finished?
    answer: I can start waiting for the matching response before the action. Or I can use `expect.poll` in Playwright Test. It observes a value until the value reaches the expected state.
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

For `locator.click()`, Playwright waits for a locator, its way of finding an element, to have a single match. That element must be visible, enabled, and stable, which means not moving. It must be able to receive events at the click point. It must also sit outside an inert subtree, a part of the page that ignores user input.

A button can be painted on the screen but sit behind a spinner that intercepts the click. Other actions have their own set of checks. So I'd read the call log, the list of steps Playwright reports, for the actual action that timed out.

I find what the user is waiting for. Then I decide whether it should have happened. If the overlay, the layer covering the button, is stuck because a request failed, I want the failure to point there. Forcing the click can bypass checks that were telling me about the bug.

### Example

On a shipping form, I'd inspect the pending rate lookup. I'd also look for the chosen delivery option. Once a normal click works, I'd still assert the updated order summary before I call the test a pass.

In the local fixture, or test page, a shipping address is already entered. The example watches the POST made by Get rate and expects a quote of 750 cents. That check tests the lookup on its own. The summary needs its own assertion.
