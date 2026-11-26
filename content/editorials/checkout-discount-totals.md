---
problem: scenario/checkout-discount-totals
---

Before choosing prices, ask what counts toward the subtotal, whether equality qualifies, and how the discounts and rounding apply. Otherwise a passing `19.99` cart could be telling you something about excluded items instead of the boundary you meant to check.

Use four minutes to straddle the minimum with controlled carts and six to follow one rounding-sensitive cart through payment. Prepare the lines, record the final quote, capture the authorization, then read the saved order. Keeping the quote from before submission matters; recomputing it afterward could hide the dispute the customer would see.

The pure calculation belongs in a small unit table with explicit expected amounts. Keep a separate API integration check for the values sent to payment and stored with the order. An over-authorization blocks this release because the customer agreed to the quote and the final charge can differ. Testing invalid-code messages is a reasonable follow-up, but it cannot catch that discrepancy.

An interviewer listens for the value used as the source of truth at each step. See [ISTQB CTFL, boundary value analysis and test levels](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
