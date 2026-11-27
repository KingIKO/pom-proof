---
problem: scenario/checkout-discount-totals
---

## What is going on

The checkout change adds a minimum eligible subtotal. That is the smallest total of eligible items that earns the order discount. The change also adds a second kind of discount next to item discounts. The calculation can be right on its own while payment or order storage uses a different amount.

## The answer

1. Ask which items count, whether the exact minimum qualifies, how item and order discounts combine, and when rounding happens.

   **Why:** A result for a `19.99` cart could come from excluded items instead of the boundary you meant to test. The rounding rule also sets the expected quote, the total the customer sees before paying.

2. Spend four minutes on the minimum boundary and six minutes on rounding through payment.

   Compare a cart one cent below the minimum with a cart exactly at it. For an eligible cart whose total depends on rounding, compare its quote, its payment authorization (the approved charge amount), and its stored total.

   **Why:** The neighboring carts catch a cutoff in the wrong place. The rounding check catches a one-cent difference that a whole-cent discount could hide.

3. Test the pure calculator with a unit table that lists the expected amount for each case.

   **Why:** A unit table gives one piece of code fixed inputs and checks the returned amounts. The calculator is pure, so its result depends only on those inputs. That separates the eligibility and rounding rules from checkout behavior.

4. Use an API integration check to compare the deployed service's quote, the sandbox authorization, and the saved order.

   The sandbox is a test payment account that moves no real money.

   **Why:** A UI label can be correct even when the payment request or the stored order uses a different amount.

5. If payment authorizes more than the confirmed total, stop the rollout.

   **Why:** The customer agreed to the quote. They could be charged more than that.

6. Check that all amounts agree for a cart with known eligible and excluded lines.

   Create the cart and apply the code. Record the quote before submitting the cart. Record the sandbox authorization after submission. Read the confirmed order and reconcile the amounts, meaning check that they agree.

   **Why:** You record the quote before you submit, so you keep what the customer agreed to. If you recomputed the quote afterward, you could repeat the same error as the authorization.

## Why the tempting answer fails

Where the badge sits does not settle the rounding rule. Comparing the messages for expired and mistyped codes is a useful follow-up. It cannot catch a wrong authorization, though. The UI checks the pure calculator only indirectly. On its own, it cannot establish the sandbox authorization or the stored amounts.

## What the interviewer listens for

At each checkpoint, name the source of truth, the record you trust for the correct amount. Boundary value analysis tests values at and just around a limit. Explain which rule your boundary value analysis isolates.

## Sources

- [ISTQB CTFL syllabus v4.0.1, test levels (2.2.1) and boundary value analysis (4.2.2)](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
