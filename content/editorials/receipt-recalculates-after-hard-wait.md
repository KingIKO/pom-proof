---
problem: diagnosis/receipt-recalculates-after-hard-wait
---

The click works. The trace shows a change to quantity two, the correct server calculation, and the correct final receipt. The test reads the receipt at 305 ms and passes a string into `expect`. The matcher can only compare that string. Nothing tells it to read the page again when the receipt changes.

Drop the sleep and use `await expect(page.getByTestId('receipt-total')).toHaveText('$28.00')`. Playwright can read the target again until the text matches or the assertion times out. This keeps the check on what the customer sees, so a correct API response with a broken render still fails the test.

A two-second sleep might make the next run pass. It also adds two seconds when pricing is fast, and the failure returns if the update takes longer. A blind retry makes the original failure harder to interpret.

In an interview, point to the two reads of the same receipt and explain how to delay the response past 300 ms in a controlled run. A successful request alone does not show that the browser ever rendered the new amount.

[Playwright: auto-retrying assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions)
