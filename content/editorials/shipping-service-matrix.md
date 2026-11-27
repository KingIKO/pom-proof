---
problem: test-design/shipping-service-matrix
---

## What is going on

The quote first decides whether the parcel can ship. For an eligible parcel, weight sets the base price, express changes that price, and membership affects only standard service. Work out the expected fees before picking representative weights.

## The answer

1. At 5,000 grams, expect standard prices of 600 cents for a nonmember and 300 for a member. Expect 1,300 on express for each.

   **Why:** The light standard quote at the exact boundary catches the mutant that applies the heavy rate too early. Both express rows show that changing membership leaves its price alone and catch the mutant that discounts member express.

2. Repeat the four decisions at 5,001 grams. Expect standard prices of 1,000 cents for a nonmember and 700 for a member, and 1,700 on express for each.

   **Why:** The weight is immediately on the heavy side, so the decision table also serves as boundary value analysis for the price change. The heavy rows catch the mutants that omit the express surcharge or the standard member discount.

3. Expect 1,000 cents for a 20,000-gram nonmember standard parcel and `-1` for a 20,001-gram member express parcel.

   **Why:** The exact maximum catches a mutant that rejects the heaviest allowed parcel. Using membership and express above the limit shows that neither option can make an overweight parcel shippable.

## Why the tempting answer fails

Light standard for both shoppers, heavy express for a nonmember, and an overweight parcel cover the broad rules. The heavy express example catches a missing surcharge, but skipping heavy member standard and member express misses both ways to misapply the discount. The overweight example is too far from the limit to reveal whether equality passes.

## What the interviewer listens for

Decide shippability before pricing. Then explain which options affect the quote and when they are irrelevant.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, sections 4.2.2 and 4.2.3, boundaries and decision tables](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
