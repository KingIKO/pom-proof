---
problem: test-design/line-discount-rounding
---

## What is going on

The product rounds the discount once for the whole line, then subtracts it. Integer cents and whole percentages keep the numerator exact. This rule belongs to this calculation; a refund or another tax policy needs its own rounding rules.

## The answer

1. Test one unit at 10 percent off for prices of 14, 15, and 16 cents. The exact discounts are 1.4, 1.5, and 1.6 cents, which round to 1, 2, and 2. Expect to pay 13, 13, and 14 cents.

   **Why:** The below-half case catches the mutant that rounds every fraction up. The tie catches the mutant that rounds ties down. The above-half case catches truncation even away from a tie.

2. Test three units at 15 cents and 10 percent off. Round the 4.5-cent discount on the 45-cent line to 5 cents and expect 40 cents due.

   **Why:** The mutant that rounds each unit would subtract 2 cents three times and leave 39 cents due. With quantity one, that faulty implementation would agree with the correct one.

3. For two units at 199 cents expect 398 at zero percent off and zero at 100 percent off. Include a whole-cent control: three units at 200 cents and 15 percent off cost 510 cents.

   **Why:** A nonzero subtotal catches the mutant that treats an explicit zero as unset and applies a default. The other rows check both full discount and ordinary arithmetic without depending on rounding.

## Why the tempting answer fails

The 510-cent case and the single 500-cent item at 50 percent off both have whole-cent discounts. All rounding strategies agree there. The zero-percent row does catch the bad default, but it cannot distinguish rounding per item from rounding once per line.

## What the interviewer listens for

Say exactly what gets rounded and at which stage. Assert the final payable cents in either table or code mode.

## Sources

- [MDN, Math.round rounding behavior](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round)
- [ISTQB CTFL syllabus v4.0.1, section 4.2.2, boundary value analysis](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
