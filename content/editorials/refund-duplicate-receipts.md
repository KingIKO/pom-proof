---
problem: bug-report/refund-duplicate-receipts
---

## What is going on

On staging build 421 in Chrome 136, open settled test order `PP104`. Double-click **Confirm refund** before the dialog closes. Two distinct receipt messages arrive. The staging ledger, the record of money movements, shows one refund. The requirement is one customer receipt per recorded refund.

## The answer

1. Mark line 3, “The payment processor issued two refunds,” and line 4, “Every production customer is affected.”

   **Why:** Line 3 treats two messages as two financial operations, but the staging ledger has one entry. Line 4 stretches a single staging scenario to customers and an environment that nobody checked.

2. Attach only the test evidence that ties the two receipts to the one refund.

   Include the IDs and timestamps of both test receipt messages. Include the staging ledger entry and its request correlation ID.

   **Why:** The mailbox tells the separate messages apart. The ledger gives a refund count that does not depend on the mailbox. A correlation ID is a value that links every record of one request. It lets someone trace the operation instead of working it out from what arrived in the inbox.

## Why the tempting answer fails

The decoy correctly marks the unsupported production claim on line 4. It wrongly marks line 2, which reports the two messages that were observed. It also leaves the unsupported processor claim on line 3 unmarked. Receipt IDs alone cannot show how many refunds were recorded.

Use a title that says a double-click on Confirm refund produced two receipts for one refund. Keep the build, browser, test order, exact action and one-receipt expectation in the report.

## What the interviewer listens for

For a regression test, which checks that the bug stays fixed, use Playwright's `dblclick()`. Assert the receipt count and the ledger count independently. Explain why either result could be correct while the other is wrong.

## Sources

- [Playwright: locator double-click](https://playwright.dev/docs/api/class-locator#locator-dblclick)
