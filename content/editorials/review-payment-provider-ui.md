---
problem: diagnosis/review-payment-provider-ui
---

## What is going on

The merchant must send the customer to the exact hosted session URL it received. The fixture supplies that URL on a provider-owned origin and serves a local stub there. The stub deliberately leaves out the payment form.

## The answer

1. Mark line 9, the 800 ms sleep, and lines 10 and 11, the `PayGate Express` form locator and `Card number` assertion.

   **Why:** Line 9 spends time waiting for a form the stub never renders. Lines 10 and 11 require a vendor form name and field label that the merchant does not own. Either label could change without breaking the handoff.

2. Choose the vendor UI dependency as the scope problem. End this test at the exact URL assertion on line 8.

   **Why:** Line 8 proves the merchant reaches the expected session under a controlled response. If the merchant owns behavior after payment, cover it separately with a controlled callback or return response. Use a provider sandbox if a real integration check is needed, and assert the agreed behavior of that integration.

## Why the tempting answer fails

The decoy marks only the sleep and says the main issue is rendering speed. That misses both lines that depend on vendor content. An 800 ms wait, a longer wait and a locator assertion would all be waiting for a field deliberately absent from the stub. They would also make the handoff test answer a question about another team's page.

## What the interviewer listens for

Draw the line between merchant behavior and provider behavior. State what the URL assertion proves and what a separate sandbox check would add.

## Sources

- [Playwright: third-party dependencies](https://playwright.dev/docs/best-practices#avoid-testing-third-party-dependencies)
