---
problem: diagnosis/receipt-recalculates-after-hard-wait
---

## What is going on

The cart starts with one $14 item. Clicking Increase quantity sends a request for two items. The server calculates 2800 cents. The receipt eventually shows $28.00. The assertion, the test's check of the receipt total, runs before that update appears.

## The answer

1. The test takes a text snapshot, a single read of the total, before the receipt updates.

   **Why:** The locator, a rule for finding an element on the page, finds one total and reads `$14.00` at 305 ms. The pricing response arrives at 484 ms. The `expect` function receives the old text as a string. That check cannot read the page again.

2. Replace the fixed wait and single read with `await expect(page.getByTestId('receipt-total')).toHaveText('$28.00')`.

   **Why:** With a locator assertion, Playwright can keep checking the element until the text matches or the time runs out. The pricing request can return 200, the success code, with the correct amount. If the new total never appears on the receipt, the test still fails.

3. In the original run, confirm that the same total changes to `$28.00` after the failed read.

   In the corrected run, delay the pricing response past 300 ms. Check that the locator assertion passes when the text changes.

   **Why:** The later update shows the locator found the right total and that the total eventually changed. The delayed run shows that the new check follows what the customer sees instead of the old timer.

## Why the tempting answer fails

The decoy correctly identifies the snapshot and checks the total again later. A fixed two-second wait slows down fast runs. If pricing takes longer than two seconds, the test can still fail. If an unchanged rerun passes without a trace of what happened, you only know the timing allowed it to pass. Retrying without looking at the evidence makes the first failure harder to explain.

## What the interviewer listens for

Explain what the trace proves about the click and the price calculation. Name the check that proves the customer saw the new total.

## Sources

- [Playwright: auto-retrying assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions)
