---
problem: bug-report/refund-duplicate-receipts
---

Use the title “Double-clicking Confirm refund sends two receipts for one refund.” Include the staging build, browser, test order, exact steps, and the expected one-receipt outcome.

Two distinct message IDs support a duplicate mail report. The single staging ledger entry does not support a claim of two refunds. A staging reproduction also does not establish production impact. Attach only the test message IDs, timestamps, and ledger correlation ID. For a regression test, trigger the double-click with Playwright and assert both counts independently.
