---
problem: diagnosis/review-duplicated-draft-setup
---

## What is going on

Rename and archive both start from the details page for a fresh `April revenue` draft. The suite already supplies that exact state through the test-scoped `openedDraft` fixture. Read what the fixture guarantees before deciding which statements belong in the individual tests.

## The answer

1. Mark lines 4 and 11, the draft seed calls, and lines 5 and 12, the visits to the draft details page. Leave the fixture parameter lines unmarked as instructed.

   **Why:** Lines 4 and 11 duplicate the fixture's promise to create a fresh record; keeping them after adopting it could create an extra record. Lines 5 and 12 duplicate its promise to open that record. Keeping the visits can add another page load and another copy of the route to maintain.

2. Choose repeated setup already supplied by the test-scoped fixture. Request `openedDraft` in both tests, leaving the rename and archive actions and assertions in their respective bodies.

   **Why:** A change to the common starting state then belongs in one place. Each test still gets a fresh record and shows its own user action and outcome.

## Why the tempting answer fails

The decoy names the maintenance problem correctly. Marking only lines 4 and 11 misses the fixture's navigation. Moving a draft to `beforeAll` would also remove repetition, but sharing that record could let archive break rename, depending on the order. The original separate seed calls already provide isolation; the evidence shows duplicate preparation.

## What the interviewer listens for

Explain the fixture's lifetime and exactly where its responsibility ends. Show that both tests can still run independently.

## Sources

- [Playwright: fixtures](https://playwright.dev/docs/test-fixtures)
