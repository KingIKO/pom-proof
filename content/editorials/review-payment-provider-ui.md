---
problem: diagnosis/review-payment-provider-ui
---

## What is going on

The merchant must send the customer to the exact session URL it received from the payment provider. The test fixture, reusable test setup, supplies a known URL on the provider's origin. The origin is the part of the address that identifies where the page is served, before its path. The fixture serves a local stub at that URL, a stand-in page that leaves out the payment form on purpose.

## The answer

1. Mark the fixed wait on line 9 and the checks of provider content on lines 10 and 11.

   **Why:** The 800 ms wait gives the form time to appear, but the stub never displays it. The locator on line 10 is a rule for finding the `PayGate Express` form. The assertion on line 11 checks for a visible field called `Card number`. The provider owns both labels. Either could change without breaking the merchant's redirect to hosted checkout.

2. The handoff test depends on page content that the payment provider owns.

   End the handoff test at the exact URL check on line 8.

   If the merchant owns behavior after payment, test it separately with a controlled callback or return response. A callback is a message the provider sends back after payment. If you need to test the real connection between the two systems, use the provider's sandbox, a test environment. Check the behavior both systems agree to provide.

   **Why:** With the response set by the fixture, line 8 proves the merchant reaches the expected session. A separate sandbox check can test what both systems have agreed to do without making the merchant's redirect test depend on the provider's page.

## Why the tempting answer fails

The decoy treats this as a slow page and marks only the fixed wait. It misses both lines that depend on content the provider owns. If you wait 800 ms or longer, the field still won't appear in the stub. A locator assertion, a check that waits for an element to meet a condition, won't help either. All of those approaches make the handoff test check another team's page.

## What the interviewer listens for

Explain which behavior the merchant owns and which the provider owns. Say what the URL check proves and what a separate sandbox test could prove.

## Sources

- [Playwright: third-party dependencies](https://playwright.dev/docs/best-practices#avoid-testing-third-party-dependencies)
