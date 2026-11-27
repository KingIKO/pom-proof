---
title: Notification tests share a workspace account
kind: diagnosis
topic: test-isolation
difficulty: hard
minutes: 8
roles: [sdet, senior]
items:
  - id: cause
    type: single-choice
    prompt: What explains both failing runs?
    choices:
      - { id: shared-preference, text: The delivery test assumes that another test already turned on email for the account both workers use. }
      - { id: context, text: Playwright carries a previous page into the second worker through its page fixture. }
      - { id: queue, text: The mail queue drops jobs whenever it receives more than one test message. }
      - { id: polling, text: "The mail helper stops checking before the expected message arrives, whatever the setting is." }
  - id: fix
    type: single-choice
    prompt: Which fix works in any test order and when tests run in parallel?
    choices:
      - { id: serial, text: Keep the same account and always run the two tests in the order that passes. }
      - { id: context, text: Keep the shared account and create a fresh browser context for each test. }
      - { id: fixtures, text: Give each test its own account and inbox and set its required preference in setup. }
      - { id: retries, text: Retry each check for a missing message so that the other worker has time to finish. }
  - id: evidence
    type: multi-select
    prompt: Which observations tie both failures to the same cause?
    choices:
      - { id: own-sessions, text: The browser traces from the two tests show two different context IDs for their signed-in pages. }
      - { id: audit, text: "The trace shows invoice dispatch reads `u7`'s setting before the settings write for that account." }
      - { id: rerun, text: "On a faster runner, the same suite passes once when the browser runs without a visible window." }
      - { id: reversed, text: The delivery test fails alone with email off and passes when its own setup turns email on. }
reference:
  cause: shared-preference
  fix: fixtures
  evidence: [audit, reversed]
decoy:
  cause: shared-preference
  fix: serial
  evidence: [audit, own-sessions]
---

These snippets come from two test files. Each file starts with its own Playwright page. Both sign in as the same account, `u7`, from storage state. Storage state is a saved sign-in that Playwright loads into the browser. A seeded workspace, created before the run, starts with invoice email turned off.

The `configure-notices.spec.ts` file tests turning invoice email on. The `invoice-mail.spec.ts` file is supposed to test delivery. The invoice job reads the preference at dispatch time, when it sends the invoice.

A worker is a process that runs tests, and several workers can run at the same time. A browser context is an isolated browser session with its own cookies and storage.

```ts
// configure-notices.spec.ts
await page.goto('/settings/notifications');
await page.getByRole('switch', { name: 'Invoice email' }).click();
await expect(page.getByRole('status')).toHaveText('Preferences saved');

// invoice-mail.spec.ts, with generated invoice ID
await issueInvoice(invoiceId);
await expect.poll(() => inbox.hasInvoice(invoiceId)).toBe(true);
```

```text
serial, fresh seed: configure-notices -> invoice-mail PASS
serial, reversed:   invoice-mail FAIL (dispatch skipped: email disabled)
parallel, fresh seed:
  w1 invoice-mail      dispatch invoice inv-81 skipped, u7 email=false
  w0 configure-notices preference saved, u7 email=true
suite note: another preference test can also disable invoice email
```
