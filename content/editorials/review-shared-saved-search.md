---
problem: diagnosis/review-shared-saved-search
---

## What is going on

Both tests start with the user already signed in. The sharing test uses the `searches` fixture, reusable test setup, to create a saved search. The fixture deletes the record when that test ends. The removal test tries to open that search without creating one of its own.

## The answer

1. Mark the statements that share the record ID on lines 3, 6 and 12. Leave the test declarations unmarked.

   **Why:** Line 3 declares `searchId` outside either test, so both tests can use it. Line 6 stores the sharing test's record ID there. Line 12 uses that ID to open the record. If removal runs alone, no test supplies the ID or creates that record.

2. The removal test depends on the earlier sharing test for the saved search ID.

   Create a separate saved search in the removal test through the fixture. Use the new ID only inside removal and keep the sharing test's existing local `id`.

   **Why:** Test isolation means each test can run on its own. Each test's fixture then cleans up only the record that test uses. The tests can run alone or together without depending on the other's ID or cleanup timing.

## Why the tempting answer fails

The decoy correctly marks lines 3 and 12. It misses line 6, where the sharing test stores its ID for removal to use. Running the tests one after the other cannot keep a record the fixture deletes after sharing. A new browser context, a separate browser session, cannot restore that database record either.

## What the interviewer listens for

Name which test owns each record and when the fixture deletes it. Check the fix by running each test alone and then running both together.

## Sources

- [Playwright: test fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright: test isolation](https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible)
