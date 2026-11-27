---
problem: diagnosis/review-positional-refund-locators
---

## What is going on

The `refundPair` fixture is test setup that creates two paid orders with different IDs. The test must refund the `target` order and leave the `other` order paid. The table can change the row order. The build can also change the button's CSS class, a name used for styling, without changing what the customer sees.

## The answer

1. Mark the row locator on line 6 and the button locator on line 7.

   **Why:** A locator is a rule for finding part of the page. On line 6, `nth(2)` picks the third row, which may be a different order after a sort or layout change. On line 7, the selector `.RefundButton_q7hr4` finds the button by class. If the build renames that class, the locator can stop finding a button that still works.

2. The test picks the order by row position and the refund button by a generated CSS class.

   Find the row by `target.id`. For example, match a cell containing that exact text. In that row, use `getByRole('button', { name: 'Request refund', exact: true })` to find the button by its accessible name, the name assistive tools use.

   Keep the confirmation click inside the dialog. Check that the target was refunded and the other order stayed paid.

   **Why:** The ID picks the right order before the click, even if the rows move. The accessible name selects the intended action without relying on a generated class. The two status checks catch a refund that changes the wrong order.

## Why the tempting answer fails

The decoy names both locator risks but marks only line 7. Looking for a button by its role fixes the button lookup. The test still picks whichever order happens to be third. Later checks could catch a wrong refund after it happens. Finding the row by ID should stop the test from clicking the wrong refund button in the first place.

## What the interviewer listens for

Propose swapping the rows the fixture creates and changing the generated class. The test should still refund the same order ID and leave the other order paid.

## Sources

- [Playwright: user-facing locators](https://playwright.dev/docs/best-practices#prefer-user-facing-attributes-to-xpath-or-css-selectors)
