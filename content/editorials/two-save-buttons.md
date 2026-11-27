---
problem: diagnosis/two-save-buttons
---

## What is going on

The test edits a field inside Shipping address, then looks for Save across the whole page. On desktop, both Shipping address and Billing address have a visible Save button. The passing mobile run only exercises the layout where the inactive group is hidden.

## The answer

1. Diagnose the two matches from the page-level Save locator as the cause of the desktop failure.

   **Why:** A Playwright click needs a single target. Exact matching can distinguish `Save` from `Save draft`, but both desktop buttons have the same accessible name, so the click fails without picking one for the test.

2. Use the group with role `group` and name `Shipping address`, then call `shipping.getByRole('button', { name: 'Save', exact: true }).click()`. Keep the status assertion inside the group.

   **Why:** The group supplies the same context a customer uses to tell the buttons apart. Checking the status in that group keeps the action and feedback tied to shipping.

3. Check that the unscoped locator matches two targets and the scoped locator finds one inside Shipping address. Swap the groups and use the trace to confirm the click still submits the shipping update.

   **Why:** A count can establish uniqueness without proving the intended action was sent. The swapped layout tests whether the action follows the group when its position changes.

## Why the tempting answer fails

The decoy correctly names the ambiguity. `first()` can pass today and silently select billing after a reorder. A screenshot showing shipping first and a check that the target is visible describe this layout only. A sleep or retry leaves both intentional targets in place.

## What the interviewer listens for

Explain how to identify the intended action independently of its position and how to confirm which update actually went out.

## Sources

- [Playwright: strictness](https://playwright.dev/docs/locators#strictness)
- [Playwright: chaining locators](https://playwright.dev/docs/best-practices#use-chaining-and-filtering)
