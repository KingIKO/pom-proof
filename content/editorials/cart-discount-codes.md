---
problem: test-design/cart-discount-codes
---

Group the inputs by the rule they exercise. The public code works on any order, the first-order code depends on purchase history, and an unknown or empty code gives zero. Use `FIRST10` with both values of `firstOrder`. That pair changes only the eligibility flag and tells you whether the rule is enforced. Showing that `SAVE5` works for a returning customer checks that the restriction hasn't been applied to every promotion.

Test normalization separately. `SaVe5` changes only the case of the canonical code. `" FIRST10 "` tests spaces around the code for an eligible shopper. `SAVE 5` gives zero because the space splits the code. Testing just one mixed-case input with padding makes it harder to tell which operation was left out.

The weaker answer checks both canonical codes on eligible shoppers and includes an unknown code. It can notice that one promotion is missing from the lookup. It never tries to use the first-order promotion on a repeat purchase, and every recognized input already has the expected case and spacing.

An interviewer listens for a reason each partition was chosen and for a concrete check that a permissive normalizer hasn't turned an invalid code into a valid one.

Source: [ISTQB CTFL Syllabus v4.0.1, section 4.2.1, equivalence partitioning](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
