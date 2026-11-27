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
    prompt: Where does the timeout in the log start?
    choices:
      - { id: frontend-route, text: The browser sends a tax request before a Playwright route can intercept it. }
      - { id: upstream, text: The checkout server calls the live tax provider and times out waiting for it. }
      - { id: visibility, text: Checkout CSS hides a quote that has already loaded. }
      - { id: locator, text: The test finds the posted tax amount with the wrong test ID. }
  - id: fix
    type: single-choice
    prompt: How can this test keep covering the real checkout endpoint without depending on the provider?
    choices:
      - { id: page-route, text: "Use `page.route` in the browser test to intercept requests to the provider hostname." }
      - { id: retries, text: "Whenever the tax provider responds slowly, retry the checkout request twice." }
      - { id: wait, text: Raise the timeout for the check on the visible tax total above the provider's deadline. }
      - { id: server-stub, text: "Use a controlled stub in the test server's tax adapter and test the sandbox separately." }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis and exercise the fix?
    choices:
      - { id: correlated, text: The browser request and the outgoing provider timeout share the same server trace ID. }
      - { id: wait-green, text: A rerun passes once when the assertion on the displayed tax total has a longer timeout. }
      - { id: stubbed, text: "With the controlled provider, the browser shows the seeded quote from the real checkout endpoint." }
      - { id: cached, text: On a local run the server gets the quote from its cache without calling the tax provider. }
reference:
  cause: upstream
  fix: server-stub
  evidence: [correlated, stubbed]
decoy:
  cause: upstream
  fix: page-route
  evidence: [correlated, wait-green]
---

This test covers the checkout endpoint, the address where the browser requests a quote. The checkout server asks a tax provider for the quote. It uses the reply to fill the tax line in the order summary. A warm cache already holds saved results. Local runs usually find the quote in the cache.

CI is the automated system that runs the tests. It starts with an empty cache. Its checkout server uses the live tax provider.

The tax adapter is the server code that talks to the provider. A stub is a stand-in service that returns fixed answers. A sandbox is the provider's test environment. A trace ID links the log lines for one request.

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
