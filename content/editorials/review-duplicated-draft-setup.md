---
problem: diagnosis/review-duplicated-draft-setup
---

Mark lines 4, 5, 11 and 12. Each pair creates the same starting state and opens the same details route. The suite already names that setup `openedDraft`, and it creates a fresh record for each test. Ask for that fixture in each test and leave the rename and archive actions visible where they are.

The weak answer marks just the seed calls and leaves both navigation calls in place. Navigation is also part of the fixture's promise, so repeating it can cause another load or create a second place to maintain the path. Check what state the fixture returns before deciding which preparation belongs in the test.

Using a shared draft in `beforeAll` would cut duplicated lines at the cost of test isolation. Archiving the record could break rename depending on the order. The original separate `seed` calls do provide isolation; the issue is maintenance, not a confirmed shared-state bug.

An interviewer will listen for a fixture with a clear lifetime and a test whose behavior remains easy to read.

[Playwright: fixtures](https://playwright.dev/docs/test-fixtures)
