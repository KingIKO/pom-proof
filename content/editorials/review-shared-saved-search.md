---
problem: diagnosis/review-shared-saved-search
---

## What is going on

Both tests start on authenticated pages. Sharing creates a saved search through `searches`, a fixture that cleans up the record when that test ends. Removal tries to open the saved search without creating one of its own.

## The answer

1. Mark line 3, the module-level `searchId` declaration, line 6, the assignment from the sharing test, and line 12, the navigation that reads it. Leave the test declarations unmarked.

   **Why:** Line 3 lets a value escape the scope of the test that owns it. Line 6 puts the first test's record ID in that shared variable. Line 12 then assumes the value was assigned and the record still exists, neither of which holds when running removal alone.

2. Choose dependence on an earlier test's record ID as the isolation bug. Have removal create its own search through the fixture and use the returned ID locally. Keep sharing's existing local `id`.

   **Why:** Giving each test its own record ties cleanup to the test using it. Each test can run by itself or beside the other without borrowing a valid ID or racing a cleanup.

## Why the tempting answer fails

The decoy names the right isolation problem and marks lines 3 and 12, but omits the assignment on line 6, where the dependency is handed off. Serial execution cannot preserve a record the fixture deletes after sharing. A new browser context cannot make that database record reappear either.

## What the interviewer listens for

Name the record's owner and when cleanup runs. Verify the fix by running each test alone and both tests together.

## Sources

- [Playwright: test fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright: test isolation](https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible)
