---
problem: test-design/delivery-fee-mutants
---

## What is going on

Local delivery costs 450 cents until the subtotal reaches 5,000 cents, when it becomes free. Remote delivery stays at 900 cents. Boundary value analysis checks where the local price changes. The remote control checks whether that change applies to the wrong destination.

## The answer

1. Use 4,999 and 5,000 cents for local delivery, expecting 450 cents just below the threshold and zero at it.

   **Why:** Each side catches a different misplaced cutoff. One mutant waives the fee a cent early, so it fails at 4,999. Another requires more than 5,000, so it fails at exactly 5,000. Moving either test further from the threshold can make the faulty comparison agree with the correct one.

2. Keep the subtotal at 5,000 cents, switch to remote delivery, and expect 900 cents.

   **Why:** Only the zone changed. The mutant that grants free delivery to remote orders fails here, while a below-threshold remote order would still be charged correctly.

## Why the tempting answer fails

At 2,400 cents a local order still costs 450 under all three mutants, and at 9,200 it is still free. A remote order at 2,400 costs 900 even if the mutant would waive the fee at 5,000. Those checks illustrate the usual prices, but all the faulty versions pass them.

## What the interviewer listens for

Explain what each row rules out. Use table mode to make the quote matrix readable or code mode to assert the same exact fees close to the pricing function. A focused Playwright test can separately check that the fee shown at checkout reaches the order total.

## Sources

- [ISTQB CTFL syllabus v4.0.1, section 4.2.2, boundary value analysis](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [Playwright test assertions](https://playwright.dev/docs/test-assertions)
