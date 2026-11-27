---
problem: diagnosis/receipt-recalculates-after-hard-wait
---

## What is going on

The cart starts with one $14 item. The quantity click works: the request sends quantity two, the server calculates 2800 cents, and the receipt eventually shows $28.00. The failed assertion runs between the click and that render.

## The answer

1. Diagnose a text snapshot taken before the receipt updates.

   **Why:** The locator finds one total and reads `$14.00` at 305 ms. The pricing response arrives at 484 ms. Once `expect` receives a string, the matcher compares that value and has no way to read the total again.

2. Remove the fixed wait and use `await expect(page.getByTestId('receipt-total')).toHaveText('$28.00')`.

   **Why:** Playwright can reevaluate a locator assertion until the expected text appears or the assertion times out. Keeping the check on the receipt means a 200 with a correct calculation still fails if the new total never renders.

3. Confirm that the same total changes to `$28.00` after the failed read. Then deliberately delay pricing past 300 ms and check that the locator assertion passes when the text changes.

   **Why:** The later read distinguishes delayed rendering from a wrong selector or a total that never updates. The delayed run shows the corrected assertion follows the visible change rather than the original timer.

## Why the tempting answer fails

The decoy correctly identifies the snapshot and keeps the useful later observation. A two-second sleep adds delay to fast runs and still fails if pricing takes longer. A green unchanged rerun without a trace only shows that timing differed enough to pass. Blind retries make the original failure harder to interpret.

## What the interviewer listens for

Explain what the trace proves about the click and price calculation, then identify the one check that proves the customer saw the updated total.

## Sources

- [Playwright: auto-retrying assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions)
