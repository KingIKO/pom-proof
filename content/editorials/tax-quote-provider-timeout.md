---
problem: diagnosis/tax-quote-provider-timeout
---

## What is going on

Local runs usually use a cached quote. CI starts with an empty cache, so the checkout server calls the live tax provider. The browser receives a 502 from checkout and shows `Unavailable` where the test expected `$2.18`.

## The answer

1. Locate the timeout in the checkout server's outbound call to the live provider.

   **Why:** The server log for `q-482` records a cache miss, an outbound request and the provider's two-second deadline being exceeded. The browser's failed checkout response carries the same trace ID. A longer UI assertion cannot turn that response into a quote.

2. Point the test server's tax adapter at a controlled provider stub that returns a fixed quote for the expected request inputs. Keep a separate sandbox integration check.

   **Why:** The real checkout endpoint still calls its adapter and maps the result. Matching inputs catches a wrong postal code that a stub returning the same quote for everything could hide. The sandbox can catch drift in the real provider's contract.

3. Correlate the browser response with the outbound timeout by trace ID. Then run against the controlled provider and confirm the real endpoint returns the seeded quote and the order summary shows `$2.18`.

   **Why:** Correlation ties the two network hops together. The endpoint and UI checks show the quote made it through checkout all the way to the customer.

## Why the tempting answer fails

The decoy correctly names the upstream timeout and keeps the trace ID check. `page.route` on the provider hostname cannot catch a request the server makes. Stubbing `/api/checkout/quote` in the browser would fit a narrower UI test but skip this endpoint. One pass with a longer assertion timeout leaves the provider dependency in place.

## What the interviewer listens for

Name who sends each request and show why the replacement belongs at the provider side of the checkout adapter.

## Sources

- [Playwright: browser network requests](https://playwright.dev/docs/network)
- [Playwright: third-party dependencies](https://playwright.dev/docs/best-practices#avoid-testing-third-party-dependencies)
