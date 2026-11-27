---
problem: test-design/line-discount-rounding
---

## What is going on

The product rounds the discount once for the whole cart line, then subtracts it. Prices are integer cents and discounts are whole percentages. So the numerator, the subtotal times the percentage before division, stays exact. This rule is specific to this calculation. A refund or another tax policy needs its own rounding rules.

## The answer

1. Test one unit at 10 percent off for prices of 14, 15, and 16 cents.

   The exact discounts of 1.4, 1.5, and 1.6 cents round to 1, 2, and 2. Expect to pay 13, 13, and 14 cents, in that order.

   **Why:** The below-half case catches code that rounds every fraction up. A mutant is a copy of the code with one planted mistake. The tie, exactly half a cent, catches the mutant that rounds ties down. The above-half case catches truncation, which drops the fraction, even away from a tie.

2. For three units at 15 cents each and 10 percent off, expect 40 cents due.

   **Why:** The mutant that rounds each unit would subtract 2 cents three times and leave 39 cents due. The correct rule rounds the 4.5-cent discount on the 45-cent line to 5 cents once. With a quantity of one, the faulty code would agree with the correct code.

3. Check the zero-discount, full-discount and whole-cent cases.

   For two units at 199 cents each, expect 398 cents at zero percent off and zero at 100 percent off. For three units at 200 cents each and 15 percent off, expect 510 cents.

   **Why:** The nonzero subtotal exposes the mutant that treats an explicit zero as unset and applies a default. The full-discount and whole-cent rows check ordinary arithmetic without depending on rounding.

## Why the tempting answer fails

The decoy, the tempting set of rows, includes the 510-cent case and a single 500-cent item at 50 percent off. Both have discounts in whole cents, so all rounding strategies agree there. The zero-percent row does catch the bad default. But it cannot tell rounding per item apart from rounding once per line.

## What the interviewer listens for

Say exactly what gets rounded and at which stage. In table mode or code mode, check the final cents the customer pays.

## Sources

- [MDN, Math.round rounding behavior](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round)
- [ISTQB CTFL syllabus v4.0.1, section 4.2.2, boundary value analysis](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
