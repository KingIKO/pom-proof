---
title: "The tests fail only when they run at the same time. Where do you look first?"
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: scenario
oneLine: "I check for accounts, files, and records both tests can change, even when they use separate browser sessions."
looksFor:
  - "Check whether tests share data on the server even with separate browser sessions."
  - "Give separate IDs to anything each test needs to change."
  - "Remove only the data each test created."
  - "Rerun the tests together under the original conditions to check the fix."
trap: "Running the whole suite in one process and leaving the shared data bug in place."
followUps:
  - question: "What if a test needs a resource it really must share?"
    answer: "I'd control access for tests that need that resource or give the test its own copy. I'd keep unrelated tests running at the same time."
  - question: "The edit-address check passes only after reset-address. How would you find what it uses from that test?"
    answer: "I'd run the tests alone, then together in both orders, and compare the starting address. I'd rerun the larger set with a saved shuffle seed, the value that picks the order. If Edit needs a value Reset leaves behind, I'd give Edit its own setup and require it to pass alone."
sources:
  - label: Playwright test isolation
    url: https://playwright.dev/docs/browser-contexts
---

I'd pair the failing tests and check what they write. Separate browser contexts keep browser data such as cookies apart. Sessions can still change the same account on the server. I'd check record IDs, inboxes, and paths to output files before changing how many workers run the tests. I'd run the smallest pair that interferes at the same time.

I'd give each test records or accounts it can safely change. I'd clean up only the IDs the test created. If tests need shared data, I'd keep read-only fixtures, the data they start with, separate from records they change. I'd rerun the pair at the same time. Then I'd try the whole suite with its usual number of workers.

### Example

Suppose I find two settings tests that reset the same address when they finish. I'd give them separate customer records, save their IDs in the logs, and let each test remove only its own records.
