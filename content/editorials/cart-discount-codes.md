---
problem: test-design/cart-discount-codes
---

## What is going on

The shop has two promotions. One depends on purchase history, and the other is public. The lookup ignores the case of ASCII letters, the plain letters A to Z. It also ignores ASCII spaces at the start and end of the code. Spaces inside the code still change what the shopper entered.

## The answer

1. Test how order history affects `FIRST10` and `SAVE5`.

   On a first order, expect `FIRST10` to give 10 percent. On a repeat order, expect `FIRST10` to give 0 percent and `SAVE5` to give 5 percent.

   **Why:** The two `FIRST10` rows change only the order history, so they catch the planted bug that gives the first-order offer to returning shoppers. A mutant is a copy of the code with one planted bug. The returning `SAVE5` row catches the mutant that leaves out the public code. It also checks that the first-order rule does not apply to every promotion.

2. Test how the code handles changes in case and spacing.

   On a first order, expect 5 percent for mixed-case `SaVe5` and 10 percent for `" FIRST10 "`.

   **Why:** `SaVe5` catches a case-sensitive lookup, one that treats upper-case and lower-case letters as different. `" FIRST10 "` catches a lookup that keeps the outer spaces. Each input changes one property. If one input mixed both changes, a failure would be harder to diagnose.

3. Expect zero for `SAVE 5` and `MISSING` on repeat orders, and for an empty code on a first order.

   **Why:** `SAVE 5` catches the mutant that removes the inner space and turns an invalid input into an offer. A space inside the code must still count. The unknown and empty rows check that the result falls back to zero even when the order would otherwise qualify.

## Why the tempting answer fails

The decoy, the tempting set of rows, tests the standard first-order code, the public code and an unknown code. Those rows are useful, and the public-code row can catch a missing lookup entry. But the decoy never offers `FIRST10` to a returning shopper. It also writes every recognized code in its standard case and spacing. It never asks whether a space inside a code can create a discount.

## What the interviewer listens for

An equivalence partition is a group of inputs that the code should treat the same way. Explain why each partition gets its own row. Then explain how you tell the intended cleanup of the code apart from accepting an invalid code.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.1, equivalence partitioning](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
