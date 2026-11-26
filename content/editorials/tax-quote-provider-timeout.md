---
problem: diagnosis/tax-quote-provider-timeout
---

Start with `q-482`. The browser sent a quote request to the checkout server, and the checkout server sent a separate request to the provider. The outbound call timed out. The browser got a 502 and rendered `Unavailable`, so waiting for the same response to produce $2.18 would not help.

In this test, point the checkout server's tax adapter at a controlled provider stub. Send a fixed quote from the stub, exercise the real checkout endpoint, then check that the browser displays $2.18. The stub should match the quote inputs so a request for the wrong postal code cannot accidentally pass. Use a separate sandbox check to catch drift in the real provider's contract.

The tempting fix is a browser `page.route` on the provider hostname. The browser never requests that URL. Stubbing `/api/checkout/quote` instead would be valid for a narrower UI test, but it would bypass the endpoint this check is supposed to include.

An interviewer will listen for where the timeout starts and which assertion proves the quote made it from the adapter onto the page.

[Playwright: browser network requests](https://playwright.dev/docs/network) · [Playwright: third-party dependencies](https://playwright.dev/docs/best-practices#avoid-testing-third-party-dependencies)
