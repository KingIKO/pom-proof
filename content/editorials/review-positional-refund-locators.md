---
problem: diagnosis/review-positional-refund-locators
---

## What is going on

The fixture creates two paid orders with different IDs. The test must refund `target` and leave `other` paid. The table can reorder and the build can change the action's generated CSS class without changing what the customer sees.

## The answer

1. Mark line 6, which selects the third row with `nth(2)`, and line 7, which clicks `.RefundButton_q7hr4`.

   **Why:** Line 6 can point at a different order after a sort or layout change. Line 7 can stop finding a working action whenever the build renames its class.

2. Choose the positional row locator and generated action class as the problem. Find the row by `target.id`, for example by filtering to a cell with that exact text. In the row, use `getByRole('button', { name: 'Request refund', exact: true })`. Keep the confirmation scoped to the dialog and both order-state assertions.

   **Why:** Identity picks the right record before the click, and the accessible name picks the action within that record. The state checks then show that the intended order changed and the other stayed paid.

## Why the tempting answer fails

The decoy names both locator risks but marks only line 7. Replacing the CSS class with a role fixes the button lookup while still choosing whichever order happens to be third. The later assertions could catch a wrong refund after it occurs; the row locator should prevent the wrong action in the first place.

## What the interviewer listens for

Propose swapping the fixture rows and changing the generated class. The same order ID should still be refunded, and the other record should remain paid.

## Sources

- [Playwright: user-facing locators](https://playwright.dev/docs/best-practices#prefer-user-facing-attributes-to-xpath-or-css-selectors)
