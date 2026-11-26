---
title: Checkout stalls on a live tax quote
kind: diagnosis
topic: test-isolation
difficulty: hard
minutes: 7
roles: [automation, sdet, senior]
items:
  - id: cause
    type: single-choice
    prompt: Where does the observed timeout start?
    choices:
      - { id: frontend-route, text: The browser sends a tax request before a Playwright route can intercept it. }
      - { id: upstream, text: The checkout server is calling the live tax provider and times out there. }
      - { id: visibility, text: A loaded quote is hidden by checkout CSS. }
      - { id: locator, text: The test uses the wrong test ID to locate a posted tax amount. }
  - id: fix
    type: single-choice
    prompt: How should this test keep covering the real checkout endpoint without depending on the provider?
    choices:
      - { id: page-route, text: Intercept the provider hostname with page.route in the browser test. }
      - { id: retries, text: Retry checkout twice whenever the provider is slow. }
      - { id: wait, text: Raise the visible tax total assertion timeout above the provider deadline. }
      - { id: server-stub, text: Point the test server's tax adapter at a controlled provider stub and keep a separate sandbox integration check. }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis and exercise the fix?
    choices:
      - { id: correlated, text: The browser request and the outbound provider timeout share the same server trace ID. }
      - { id: wait-green, text: A rerun with a longer assertion timeout passes once. }
      - { id: stubbed, text: "With the controlled provider, the real checkout endpoint returns the seeded quote and the browser displays it." }
      - { id: cached, text: A local run hits a cached quote and never calls the provider. }
reference:
  cause: upstream
  fix: server-stub
  evidence: [correlated, stubbed]
decoy:
  cause: upstream
  fix: page-route
  evidence: [correlated, wait-green]
---

This test covers the checkout endpoint that asks a tax provider for a quote and maps the provider response to the tax line in the order summary. Local runs usually hit a warm cache. CI starts with an empty cache and its checkout server points at the live provider.

```ts
await page.goto('/checkout');
await page.getByLabel('Postal code').fill('98104');
await page.getByRole('button', { name: 'Update totals' }).click();
await expect(page.getByTestId('tax-total')).toHaveText('$2.18');
```

```text
browser   POST /api/checkout/quote
backend   trace=q-482 tax cache miss
backend   trace=q-482 outbound POST https://tax-provider.example/quote
backend   trace=q-482 provider request exceeded its 2 s deadline
browser   502 /api/checkout/quote, x-trace-id=q-482
assert    expected "$2.18", received "Unavailable"
```
