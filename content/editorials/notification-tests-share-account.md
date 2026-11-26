---
problem: diagnosis/notification-tests-share-account
---

The delivery test needs invoice email to be on. Running the settings test first happens to meet that precondition. Running delivery alone on a fresh seed exposes the missing setup. With parallel workers, both sessions use `u7`, so the dispatch job can read the preference before the settings test enables it or after another test turns it off.

Provide each test with its own account and inbox. Seed invoice email off for the settings test so it can exercise the switch. Seed it on for delivery so the only behavior under test is delivery. Match the email to the generated invoice ID, which prevents unrelated messages from satisfying the check.

Serializing the tests preserves the accidental dependency. A fresh browser context with the same account would isolate cookies and browser storage while the server would still read the same preference.

In an interview, use the audit trail to map writes and the dispatch read to `u7`. Then run delivery with its own setup, both alone and beside a test that changes another account's preference.

[Playwright: browser contexts](https://playwright.dev/docs/browser-contexts) · [Playwright: accounts for parallel tests](https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker)
