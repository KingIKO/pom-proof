---
problem: diagnosis/review-duplicated-draft-setup
---

## What is going on

The rename and archive tests both start on the details page for a fresh `April revenue` draft. The suite already provides that starting point through the `openedDraft` fixture, reusable setup that runs separately for each test. Because it is test-scoped, each test gets its own draft. Check what the fixture does before deciding what each test needs to do itself.

## The answer

1. Mark the repeated setup on lines 4, 5, 11 and 12. Leave the lines that request fixtures unmarked.

   **Why:** Lines 4 and 11 create a fresh draft. If you keep those calls after using the fixture, you may create an extra record. Lines 5 and 12 open the details page, which the fixture already does. Keeping those visits can add a page load and a second copy of the page address to maintain.

2. The tests repeat draft creation and page visits that the test-scoped fixture already handles.

   Use `openedDraft` in both tests. Keep the rename and archive actions in their own tests, along with the assertions that check what happened.

   **Why:** If the starting state changes, only the fixture needs to change. Each test still gets a fresh record and shows the user action it covers and the outcome it expects.

## Why the tempting answer fails

The decoy correctly points out that both tests repeat setup. Marking only lines 4 and 11 misses the repeated page visits. A `beforeAll` hook, which runs once before the group, would also remove repetition. If both tests share its draft and archive runs first, it could break rename. The separate setup calls already keep the drafts independent.

## What the interviewer listens for

Explain when the fixture runs and where its work ends. Show why either test can still run on its own.

## Sources

- [Playwright: fixtures](https://playwright.dev/docs/test-fixtures)
