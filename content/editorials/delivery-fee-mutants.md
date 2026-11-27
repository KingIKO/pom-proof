---
problem: test-design/delivery-fee-mutants
---

## What is going on

Local delivery costs 450 cents until the subtotal reaches 5,000 cents, and then it becomes free. Remote delivery stays at 900 cents. Boundary value analysis tests values at and next to a limit, here the point where the local price changes. A remote row acts as a control, a check where only one input differs. It shows whether that price change wrongly applies to the other destination.

## The answer

1. For local delivery, expect a 450-cent fee at 4,999 cents and zero at 5,000 cents.

   **Why:** The two rows catch two mutants, copies of the code with planted mistakes. One waives the fee a cent early, so it fails at 4,999. Another requires more than 5,000, so it fails at exactly 5,000. Further from that threshold, the faulty comparison can agree with the correct one.

2. For remote delivery at 5,000 cents, expect a 900-cent fee.

   **Why:** This row catches the mutant that grants free delivery to remote orders. Only the zone changed from the previous row. A remote order below the threshold would miss it, because that mutant still charges such an order correctly.

## Why the tempting answer fails

The decoy, the tempting test, checks subtotals of 2,400 and 9,200 cents. At 2,400 cents, a local order still costs 450 under all three mutants. At 9,200, it is still free. A remote order at 2,400 costs 900 even under the mutant that would waive the fee at 5,000. Those checks show the usual prices, but all the faulty versions pass them.

## What the interviewer listens for

Explain what each row rules out. Use table mode if you want the matrix of quotes to be easy to read. Use code mode to check the same exact fees close to the pricing function. A separate, focused Playwright test can check that the fee shown at checkout reaches the order total.

## Sources

- [ISTQB CTFL syllabus v4.0.1, section 4.2.2, boundary value analysis](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [Playwright test assertions](https://playwright.dev/docs/test-assertions)
