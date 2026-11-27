---
problem: diagnosis/notification-tests-share-account
---

## What is going on

Invoice email starts off on the seeded workspace account. The settings test enables it; the delivery test issues an invoice and waits for mail. Even with different Playwright pages, both are signed in as `u7`, and the server reads that account's preference at dispatch.

## The answer

1. Diagnose a missing precondition in the delivery test: it assumes another test already enabled email on the shared account.

   **Why:** Running settings first happens to supply the precondition. Delivery on a fresh seed has no such setup, and in parallel its dispatch can read before settings enables email or after another test turns it off.

2. Give each test its own account and inbox. Seed invoice email off for the switch test and on for delivery, and match the mail to the generated invoice ID.

   **Why:** The switch test can verify the change from off to on without supplying state for another test. Delivery can verify its own message without racing another account's preference write or passing on unrelated mail.

3. Trace the settings write and dispatch read to `u7` and confirm the read comes first in the failing run. Run delivery alone with email off, then with its own setup enabling email.

   **Why:** The timestamps explain the parallel failure, and changing the preference with no other worker present tests the same cause independently. Also run delivery beside a test that changes another account's preference to check the isolation.

## Why the tempting answer fails

The decoy identifies the shared preference and keeps the useful audit trace. Running in the passing order preserves the dependency and leaves the delivery test unable to run alone. Different context IDs establish separate browser state; even fresh contexts can share the same server-side preference.

## What the interviewer listens for

Show where the dispatch reads its state and explain who owns that state for the entire test.

## Sources

- [Playwright: browser contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright: accounts for parallel tests](https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker)
