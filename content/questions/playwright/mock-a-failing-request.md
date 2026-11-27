---
title: How would you use Playwright to test the interface when a request returns an error?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Before the app sends the request, I'd set up Playwright to answer that request with an error. I'd check how the user can recover.
looksFor:
  - Set up the route before the request goes out.
  - Match only the request the test needs to change.
  - Check what the user can do to recover and what they see afterward.
  - Keep a separate test that uses the real service.
trap: Replacing every reply and taking a passing browser test as proof the real services work together.
followUps:
  - question: How would you check recovery after the error?
    answer: I'd fail the first matching request. I'd make the next attempt succeed in a way I can control. I'd check that the page shows the successful result.
  - question: What if you only need to change one part of the real reply?
    answer: I'd use `route.fetch` to get the real reply. I'd use `route.fulfill` to send it back with a changed body. If the test doesn't need some known third-party traffic, I'd block only that traffic with a separate `route.abort` rule.
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

I'd call `page.route` before the page or a user action can send the request. That method lets me set a rule for how Playwright handles matching requests. I'd match the endpoint, the URL the request goes to. If several actions use that URL, I'd also check the HTTP method, such as GET or POST. I'd use `route.fulfill` to answer with a status code and response body I choose.

I'd leave unrelated requests alone so my test makes fewer assumptions.

I'd check that the user can tell what happened and recover safely. By choosing the reply, I can make a rare failure happen on every run. I'd keep a separate check against the real service. My browser test can't tell me whether the service sends that reply in production.

### Example

For a temporary shipping quote failure, I'd return 503, a status that says the service is unavailable. I'd check that the page keeps the address and offers a retry. I'd make the retry succeed and check that the page displays the quote.

In the local checkout test app, the retry endpoint returns a successful quote as JSON, a format for structured data. I'd keep that reply and change only the price. After the retry, I'd expect the page to display $7.90.
