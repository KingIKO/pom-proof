---
problem: scenario/checkout-discount-totals
---

## What is going on

The checkout change introduces a minimum eligible subtotal and a second kind of discount. The calculation can be right on its own while payment or order storage uses a different amount.

## The answer

1. Ask which items count, whether the exact minimum qualifies, how item and order discounts combine, and when rounding happens.

   **Why:** A result for a `19.99` cart could reflect excluded items rather than the boundary you meant to test. The rounding rule also determines the expected quote.

2. Spend four minutes comparing carts one cent below and exactly at the minimum. Spend six tracing the quote, authorization, and stored total for a rounding-sensitive eligible cart.

   **Why:** The adjacent carts catch a misplaced cutoff. The second check catches a cent discrepancy that a whole-cent discount could hide.

3. Use a unit table with explicit expected amounts for the pure calculator.

   **Why:** Fixing the inputs and checking the returned amounts isolates the eligibility and rounding rules from checkout behavior.

4. Use an API integration check to compare the deployed service's quote, sandbox authorization, and saved order.

   **Why:** A UI label can be correct even when the payment request or stored order uses a different amount.

5. Stop rollout if payment authorizes more than the confirmed total.

   **Why:** The customer agreed to the quote and could be charged more.

6. Create a cart with known eligible and excluded lines, apply the code and record the quote, submit and capture the sandbox authorization, then read the confirmed order and reconcile all amounts.

   **Why:** Recording the quote before submission preserves what the customer agreed to. Recomputing it afterward could reproduce the same error as the authorization.

## Why the tempting answer fails

Badge placement does not resolve rounding. Comparing expired and mistyped code messages is a useful follow-up, but it cannot catch an incorrect authorization. The UI is an indirect way to check the pure calculator and cannot by itself establish the sandbox authorization and stored amounts.

## What the interviewer listens for

Name the source of truth at each checkpoint and explain which rule your boundary value analysis isolates.

## Sources

- [ISTQB CTFL syllabus v4.0.1, test levels (2.2.1) and boundary value analysis (4.2.2)](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
