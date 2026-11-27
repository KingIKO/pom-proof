---
problem: diagnosis/two-save-buttons
---

## What is going on

The test edits a field inside Shipping address. It then looks for Save across the whole page. On desktop, Shipping address and Billing address each have a visible Save button. The passing mobile test only covers the layout that hides the inactive group.

## The answer

1. The page-level Save locator, a rule for finding elements, matches both desktop buttons. A click needs just one match.

   **Why:** A Playwright click needs exactly one match. Exact matching can tell `Save` from `Save draft`. Both desktop buttons have the same accessible name, the name assistive tools use. Playwright fails the click rather than choosing a button for the test.

2. Limit the Save click to the group with role `group` and name `Shipping address`.

   Within that group, call `shipping.getByRole('button', { name: 'Save', exact: true }).click()`. Check the status inside the same group.

   **Why:** A role tells assistive tools what kind of element they found. The named group gives the test the same way to tell the buttons apart that customers have. Keeping the status check there ties the action and its feedback to shipping.

3. Confirm that the whole-page locator finds two buttons and the Shipping address locator finds one.

   Swap the groups and check the trace, the record of the test's actions and requests. It should show that the scoped click still submits the shipping update.

   **Why:** The count tells you the match is unique. It cannot tell you which update the page sent. The swapped layout shows whether the action follows the group when its position changes.

## Why the tempting answer fails

The decoy correctly says the locator matches both buttons. The `first()` method can pass today and quietly select billing after the groups move. A screenshot showing shipping first only describes this layout. So does a check that the chosen button is visible. A fixed wait or retry leaves both buttons in place by design.

## What the interviewer listens for

Explain how to find the intended button regardless of its position. Show how to check which update the page sent.

## Sources

- [Playwright: strictness](https://playwright.dev/docs/locators#strictness)
- [Playwright: chaining locators](https://playwright.dev/docs/best-practices#use-chaining-and-filtering)
