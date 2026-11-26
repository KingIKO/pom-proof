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
      - { id: shared-preference, text: "The delivery test assumes another test has already enabled email on the account both workers use." }
      - { id: context, text: Playwright carries a previous page into the second worker through its page fixture. }
      - { id: queue, text: The mail queue drops jobs whenever it receives more than one test message. }
      - { id: polling, text: "The mail helper stops before the expected message appears, regardless of the setting." }
  - id: fix
    type: single-choice
    prompt: Which fix addresses order and parallel execution?
    choices:
      - { id: serial, text: Keep the same account and run the two tests in their passing order every time. }
      - { id: context, text: Keep the shared account and create a fresh browser context per test. }
      - { id: fixtures, text: "Provision a separate account and inbox per test, and set each test's required preference in its own setup." }
      - { id: retries, text: Retry each missing message check so the other worker can finish. }
  - id: evidence
    type: multi-select
    prompt: Which observations tie both failures to the same cause?
    choices:
      - { id: own-sessions, text: The browser traces show different context IDs. }
      - { id: audit, text: "The trace ties the settings write and the invoice dispatch to u7, and shows the dispatch reading the preference before the write." }
      - { id: rerun, text: The headless suite passes once on a faster runner. }
      - { id: reversed, text: The delivery test fails alone with the preference off and passes when its own setup enables it. }
reference:
  cause: shared-preference
  fix: fixtures
  evidence: [audit, reversed]
decoy:
  cause: shared-preference
  fix: serial
  evidence: [audit, own-sessions]
---

These snippets are from two files. Each starts with its own Playwright page and the same signed-in account `u7` from storage state. A seeded workspace starts with invoice email off. `configure-notices.spec.ts` covers enabling it; `invoice-mail.spec.ts` is supposed to cover delivery. The invoice job reads the preference at dispatch time.

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
