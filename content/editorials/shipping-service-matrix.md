---
problem: test-design/shipping-service-matrix
---

## What is going on

The quote first decides whether the parcel can ship. For a parcel that can ship, weight sets the base price and express changes that price. Membership affects only standard service. Work out the expected fees before you pick representative weights. A mutant is a copy of the function with one planted mistake for the tests to catch.

## The answer

1. Test all four combinations of membership and express at 5,000 grams.

   For standard shipping, expect 600 cents for a nonmember and 300 for a member. For express, expect 1,300 cents for each.

   **Why:** The light standard quote at the exact boundary catches the mutant that applies the heavy rate too early. Both express rows show that membership leaves the express price alone. They catch the mutant that discounts express for members.

2. Repeat the four combinations at 5,001 grams.

   For standard shipping, expect 1,000 cents for a nonmember and 700 for a member. For express, expect 1,700 cents for each.

   **Why:** The heavy rows catch the mutants that omit the express surcharge or the standard member discount. A decision table lists the result for each combination of conditions. This weight is just over the cutoff, so the table also tests the price change with boundary value analysis. That method tests values at and next to a limit.

3. Expect 1,000 cents for a 20,000-gram nonmember standard parcel. Expect `-1` for a 20,001-gram member express parcel.

   **Why:** The exact maximum catches a mutant that rejects the heaviest allowed parcel. The overweight parcel shows that neither membership nor express can make it shippable.

## Why the tempting answer fails

The decoy, the tempting set of rows, covers the broad rules. It has light standard parcels for both shoppers, heavy express for a nonmember, and an overweight parcel. The heavy express row catches a missing surcharge. But the decoy skips heavy member standard and member express, so it misses both ways to apply the discount wrongly. Its overweight parcel is too far from the limit to show whether a weight equal to it passes.

## What the interviewer listens for

Decide whether the parcel can ship before you work out a price. Then explain which options affect the quote and when they make no difference.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, sections 4.2.2 and 4.2.3, boundaries and decision tables](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
