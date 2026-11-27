---
problem: diagnosis/notification-tests-share-account
---

## What is going on

The workspace's test account starts with invoice email turned off. The settings test turns it on. The delivery test issues an invoice and waits for the email. The tests use separate Playwright pages, but both sign in as `u7`. At dispatch, when the server decides whether to send the email, it reads that account's setting.

## The answer

1. The delivery test relies on the settings test to turn on invoice email for their shared account.

   **Why:** When the settings test runs first, it happens to enable invoice email for delivery. A delivery test on a fresh workspace gets no such setup. When the tests run at the same time, dispatch may read the setting before the settings test turns email on. Dispatch can also read it after another test turns email off.

2. Set up a separate account and inbox for each test.

   Start the switch test with invoice email off and the delivery test with it on. In the delivery test, match the message to the generated invoice ID.

   **Why:** Starting with email off lets the switch test cover the change to on. The delivery test can check its own message regardless of when another account's settings change. Matching the invoice ID keeps unrelated mail from passing the test.

3. Use the trace to show that dispatch reads the setting for `u7` before the settings test saves it for the same account.

   Run delivery alone with email off and confirm it fails. Turn email on in its own setup and confirm it passes. Then run delivery alongside a test that changes another account's setting to check that the accounts are independent.

   **Why:** The timestamps explain why invoice email is off when dispatch reads the setting in the failing parallel run. Changing only that setting tests the same cause without another worker. The separate-account run shows whether the tests still affect each other.

## Why the tempting answer fails

The decoy correctly names the shared setting and uses the audit trace, the record of when the actions ran. Keeping the passing order still leaves delivery dependent on the settings test. Different browser context IDs show that the tests use separate browser sessions. Even fresh contexts can read the same account setting on the server.

## What the interviewer listens for

Show which account dispatch reads and when it reads it. Explain how each test controls that account's setting from setup through delivery.

## Sources

- [Playwright: browser contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright: accounts for parallel tests](https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker)
