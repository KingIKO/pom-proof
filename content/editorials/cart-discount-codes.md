---
problem: test-design/cart-discount-codes
---

## What is going on

One promotion depends on purchase history and the other is public. The lookup ignores ASCII letter case and outer ASCII spaces, but spaces inside the code still change what the shopper entered.

## The answer

1. Use `FIRST10` for first and repeat orders and expect 10 and 0 percent. Use `SAVE5` on a repeat order and expect 5 percent.

   **Why:** Flipping only order history exposes the mutant that gives the first-order offer to returning shoppers. The returning `SAVE5` row catches the mutant that omits the public code and checks that eligibility was not imposed on every promotion.

2. Try mixed-case `SaVe5` on a first order and expect 5 percent. Try `" FIRST10 "` on a first order and expect 10 percent.

   **Why:** Each case changes one property: the first catches a case-sensitive lookup, and the second catches a lookup that keeps outer spaces. Mixing both changes into one input makes a failure harder to diagnose.

3. Expect zero for `SAVE 5` and `MISSING` on repeat orders and for an empty code on a first order.

   **Why:** An internal space must remain significant. `SAVE 5` catches the mutant that removes it and accidentally turns an invalid input into an active offer. The unknown and empty rows check the zero fallback even when an order would otherwise qualify.

## Why the tempting answer fails

The canonical first-order code, public code, and unknown code are useful: the public-code row can catch a missing lookup entry. But the decoy never offers `FIRST10` to a returning shopper and keeps the recognized inputs in canonical case and spacing. It also never asks whether an internal space can create a discount.

## What the interviewer listens for

Explain why each equivalence partition gets a row and how you distinguish intended cleanup from accepting an invalid code.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.1, equivalence partitioning](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
