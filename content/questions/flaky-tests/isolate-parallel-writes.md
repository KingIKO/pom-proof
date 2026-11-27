---
title: A suite only fails in parallel. Where do you look first?
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: scenario
oneLine: Look past separate browser sessions for accounts, files, or records that concurrent tests can change.
looksFor:
  - Shared server state survives browser separation
  - Unique identifiers for independently mutable resources
  - Narrow cleanup of test-owned data
  - Concurrent verification under the original conditions
trap: Setting the entire suite to one worker and leaving the shared state problem invisible.
followUps:
  - question: What if one test needs a truly shared resource?
    answer: I'd control access to that resource for the dependent tests, or allocate a dedicated copy, and leave unrelated tests parallel.
  - question: The edit-address check passes only after the reset-address check. How would you prove what it borrows?
    answer: I'd run each check alone, then run the pair in both orders and compare the starting address. I'd repeat the broader run with a recorded shuffle seed. If the edit case needs a value left by Reset, I'd give Edit its own setup and require it to pass on its own.
sources:
  - label: Playwright test isolation
    url: https://playwright.dev/docs/browser-contexts
---

I'd start by pairing failing tests and looking at what they write. Separate browser contexts isolate browser-side state, but two sessions can still edit the same server-side account. I'd check record IDs, inboxes, and output paths before changing worker counts. Running the smallest interfering pair side by side gives me a useful reproduction.

I'd give each test records or accounts it can edit independently, and use cleanup that only touches IDs it created. If there is a reason to share data, I keep read-only fixtures separate from records that tests mutate. I'd prove the fix by rerunning the pair concurrently and then checking the suite at its normal worker count.

### Example

Two settings tests reset the same address after finishing. I'd assign distinct customer records, keep their IDs in the logs, and remove only the records each test created.
