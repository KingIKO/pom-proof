---
title: How would you use Playwright to test the UI when a request returns an error?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Register a narrow route before the request and return a controlled error that lets you check the recovery path.
looksFor:
  - Register routing before the relevant request
  - Match the exact request needed for the case
  - Assert the user's recovery and resulting state
  - Keep separate evidence for the real service
trap: Mocking every request and calling the resulting browser test proof of the whole integration.
followUps:
  - question: How would you check recovery?
    answer: I'd make the failing response apply to the first intended request, allow the next attempt to succeed under controlled conditions, and verify the UI reflects the outcome.
  - question: What if you want to keep most of the real response?
    answer: I'd call route.fetch, keep the response, and use route.fulfill with a changed body. I'd use a separate, narrow route with route.abort only for known third-party traffic that the case doesn't need.
sources:
  - label: Playwright mock APIs
    url: https://playwright.dev/docs/mock
  - label: Playwright network
    url: https://playwright.dev/docs/network
  - label: Playwright Python mock and modify APIs
    url: https://playwright.dev/python/docs/mock
  - label: Playwright route methods
    url: https://playwright.dev/docs/api/class-route
  - label: Playwright Python route methods
    url: https://playwright.dev/python/docs/api/class-route
examples:
  - title: Fail the first quote and modify the real retry response
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('a shipping quote can recover', async ({ page }) => {
            let attempts = 0;
            await page.route('**/api/quote', async (route) => {
              if (route.request().method() !== 'POST') return route.continue();
              if (++attempts === 1) {
                return route.fulfill({ status: 503, json: { code: 'quote_unavailable' } });
              }
              const response = await route.fetch();
              const body = await response.json();
              await route.fulfill({ response, json: { ...body, cents: 790 } });
            });
            await page.goto('http://localhost:3000/checkout/shipping');
            await page.getByLabel('Street address').fill('20 Market Street');
            await page.getByRole('button', { name: 'Get quote' }).click();
            await expect(page.getByRole('alert')).toHaveText('Quote unavailable');
            await expect(page.getByLabel('Street address')).toHaveValue('20 Market Street');
            await page.getByRole('button', { name: 'Retry quote' }).click();
            await expect(page.getByTestId('quote-total')).toHaveText('$7.90');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_shipping_quote_recovery(page):
              first_attempt = True

              def handle_quote(route):
                  nonlocal first_attempt
                  if route.request.method != "POST":
                      return route.continue_()
                  if first_attempt:
                      first_attempt = False
                      return route.fulfill(status=503, json={"code": "quote_unavailable"})
                  response = route.fetch()
                  route.fulfill(response=response, json=response.json() | {"cents": 790})

              page.route("**/api/quote", handle_quote)
              page.goto("http://localhost:3000/checkout/shipping")
              address = page.get_by_label("Street address")
              address.fill("20 Market Street")
              page.get_by_role("button", name="Get quote").click()
              expect(page.get_by_role("alert")).to_have_text("Quote unavailable")
              expect(address).to_have_value("20 Market Street")
              page.get_by_role("button", name="Retry quote").click()
              expect(page.get_by_test_id("quote-total")).to_have_text("$7.90")
---

I'd register `page.route` before the page or user action can send the request. I'd match the endpoint and, when the same URL serves several actions, check the HTTP method too. For the request I want to fail, `route.fulfill` can return a chosen status and body. I leave unrelated requests alone so the test has fewer assumptions.

The goal is a user outcome: can someone tell what happened and safely recover? A controlled response makes a rare failure repeatable. I keep a separate check against the real service because this test doesn't show that the service returns that response in production.

### Example

For a temporary shipping quote error, I'd return 503 for the quote call. I check that the address stays filled in, the page offers a retry, and a controlled successful retry displays the quote.

On the local checkout fixture, the real retry endpoint returns a successful JSON quote. I keep its response and change only the price. The UI should display $7.90 after the retry.
