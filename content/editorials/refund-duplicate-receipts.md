---
problem: bug-report/refund-duplicate-receipts
---

## What is going on

On staging build 421 in Chrome 136, open settled test order `PP104` and double-click **Confirm refund** before the dialog closes. Two distinct receipt messages arrive, and the staging ledger shows one refund. The requirement is one customer receipt per recorded refund.

## The answer

1. Mark line 3, “The payment processor issued two refunds,” and line 4, “Every production customer is affected.”

   **Why:** Line 3 confuses two messages with two financial operations, and the staging ledger has one entry. Line 4 extrapolates a single staging scenario to customers and an environment that were never checked.

2. Attach the two test receipt message IDs and timestamps, and the staging ledger entry with its request correlation ID. Keep the attachments limited to test evidence.

   **Why:** The mailbox distinguishes separate messages, and the ledger supplies an independent refund count. The correlation ID lets someone trace the operation instead of inferring it from what arrived in the inbox.

## Why the tempting answer fails

The decoy correctly rejects the unsupported production claim on line 4, but it incorrectly marks the observed two messages on line 2 and leaves the unsupported processor claim on line 3. Receipt IDs alone cannot show how many refunds were recorded. Use the title “Double-clicking Confirm refund sends two receipts for one refund,” and keep the build, browser, test order, exact action and one-receipt expectation in the report.

## What the interviewer listens for

For a regression, use Playwright's `dblclick()` and assert the receipt count and ledger count independently. Explain why either result could be correct while the other is wrong.

## Sources

- [Playwright: locator double-click](https://playwright.dev/docs/api/class-locator#locator-dblclick)
