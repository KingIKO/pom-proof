---
problem: test-design/line-discount-rounding
---

With one unit at 10 percent off, use prices of 14, 15, and 16 cents. The exact discounts are 1.4, 1.5, and 1.6 cents. The rounded discounts must be 1, 2, and 2 cents, so the prices paid are 13, 13, and 14. The below-half case catches rounding up every fraction, the tie catches the wrong tie rule, and the above-half case catches truncation even away from a tie.

Next, buy three units at 15 cents each with the same discount. The line subtotal is 45 cents, and the 4.5-cent discount becomes 5 cents, leaving 40 cents due. Rounding each unit's discount to 2 cents before multiplying would leave 39 cents due. Use an explicit zero percent on a nonzero subtotal to catch a default applied to a real value.

The weaker answer uses whole-cent discounts and checks zero percent. It can catch the default but gives the rounding strategies the same result.

An interviewer listens for the calculation stage and scope: round the discount once for the whole line, then subtract. The exercise uses integer cents and whole percentages, so the numerator stays exact. A refund or a different tax policy would need its own rounding rules.

Source: [MDN, Math.round rounding behavior](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round).
