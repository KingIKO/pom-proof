---
title: A renewal date changes in CI
kind: diagnosis
topic: date-and-time
difficulty: medium
minutes: 6
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Why does CI show June 2?
    choices:
      - { id: seeded-offset, text: The CI job creates a renewal date that is one day later. }
      - { id: cache, text: The browser still has an earlier invoice in its cache. }
      - { id: locale, text: An English locale converts June 1 to June 2. }
      - { id: viewer-zone, text: The same instant falls on different local dates in the two browser time zones. }
  - id: fix
    type: single-choice
    prompt: How can this test of the New York display give the same result on every run?
    choices:
      - { id: ci-text, text: Accept June 2 in CI and June 1 on developer machines. }
      - { id: pin-zone, text: Keep the timestamp fixed and set the context time zone to America/New_York. }
      - { id: zone-locale, text: Keep the machine's time zone and set the browser locale to en-US. }
      - { id: midday, text: Move the fixed timestamp to midday UTC so that both dates agree. }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis?
    choices:
      - { id: same-instant, text: "The same timestamp reaches both browsers, but CI reports UTC and the local browser reports America/New_York." }
      - { id: locale-only, text: The browser in CI and the one on the developer machine both report the same English locale. }
      - { id: swap-zone, text: "On the same runner, changing only the context time zone changes June 2 to June 1." }
      - { id: late-rerun, text: The test passes when the CI job is scheduled to run at a different hour of the day. }
reference:
  cause: viewer-zone
  fix: pin-zone
  evidence: [same-instant, swap-zone]
decoy:
  cause: viewer-zone
  fix: midday
  evidence: [same-instant, locale-only]
---

As required, the account page formats the `renewalAt` timestamp in the viewer's browser time zone. This test should check the date that a New York viewer sees near midnight. The project sets `locale: 'en-US'`, and the locale controls language and date format. It leaves the `timezoneId` setting unset. A browser context is an isolated browser session with its own settings, such as its time zone.

```ts
await page.route('**/api/billing/summary', (route) =>
  route.fulfill({ json: { renewalAt: '2026-06-02T00:30:00Z' } }),
);
await page.goto('/billing');
await expect(page.getByTestId('renewal-date')).toHaveText('June 1');
```

```text
local  zone=America/New_York  renewalAt=2026-06-02T00:30:00Z  June 1
CI     zone=UTC               renewalAt=2026-06-02T00:30:00Z  June 2
CI     Expected "June 1", received "June 2"
```
