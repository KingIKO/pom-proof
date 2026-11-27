---
problem: diagnosis/tax-quote-provider-timeout
---

## What is going on

Local runs usually use a cached quote, one the checkout server saved earlier. The automated test runs in CI start with an empty cache. The checkout server therefore calls the live tax provider. The browser gets a 502 error from checkout and shows `Unavailable` where the test expects `$2.18`.

## The answer

1. The checkout server times out waiting for the live tax provider.

   **Why:** The log for `q-482` shows the server found no saved quote. The server sent a request to the tax provider, and that call exceeded its two-second deadline. The browser's failed checkout response carries the same trace ID, the label that ties both requests together. Waiting longer for the page to update cannot turn that failed response into a quote.

2. Point the test server's tax adapter, the code that talks to the tax provider, at a stub, a stand-in the test controls.

   Have the stub return a fixed quote for the expected inputs only. Keep a separate integration check in the provider's sandbox, its test environment.

   **Why:** The real checkout endpoint, the URL the browser calls for a quote, still uses the adapter and converts its reply. Checking the inputs catches mistakes such as a wrong postal code. A stub that always returns the same quote could hide that error. The sandbox check can catch changes in what the real provider accepts or returns.

3. Use the trace ID to link the browser's failed response to the server's provider timeout.

   With the stub, check that the real endpoint returns the quote the test supplied. Check that the order summary shows `$2.18`.

   **Why:** The trace ID connects the browser-to-checkout request to the checkout-to-provider request. Checking the endpoint and order summary shows that the quote reaches the customer.

## Why the tempting answer fails

The decoy correctly names the provider timeout and keeps the trace ID check. Playwright's `page.route` can catch browser requests. It cannot catch the checkout server's request to the provider. Replacing the response to `/api/checkout/quote` in the browser could work for a test of the page alone. That replacement skips the real checkout endpoint.

One pass with a longer timeout still leaves the test depending on the live provider.

## What the interviewer listens for

Name what sends each request. Explain why the stand-in should replace the tax provider the checkout adapter calls.

## Sources

- [Playwright: browser network requests](https://playwright.dev/docs/network)
- [Playwright: third-party dependencies](https://playwright.dev/docs/best-practices#avoid-testing-third-party-dependencies)
