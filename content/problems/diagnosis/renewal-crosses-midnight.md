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
      - { id: seeded-offset, text: The CI job seeds a renewal one day later. }
      - { id: cache, text: A previous invoice is still cached in the browser. }
      - { id: locale, text: An English locale converts June 1 to June 2. }
      - { id: viewer-zone, text: The same instant falls on different local dates in the two browser time zones. }
  - id: fix
    type: single-choice
    prompt: How should this New York display test be made repeatable?
    choices:
      - { id: ci-text, text: Accept June 2 in CI and June 1 on developer machines. }
      - { id: pin-zone, text: Keep the fixed timestamp and set the browser context time zone to America/New_York. }
      - { id: zone-locale, text: Set the browser locale to en-US and keep the browser time zone inherited from the machine. }
      - { id: midday, text: Move the seed timestamp to midday UTC so the dates agree. }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis?
    choices:
      - { id: same-instant, text: Both browsers receive the same timestamp but report UTC and America/New_York respectively. }
      - { id: locale-only, text: Both browsers report the same English locale. }
      - { id: swap-zone, text: "On the same runner, changing only the context time zone changes June 2 to June 1." }
      - { id: late-rerun, text: The test passes when the job is scheduled for a different hour. }
reference:
  cause: viewer-zone
  fix: pin-zone
  evidence: [same-instant, swap-zone]
decoy:
  cause: viewer-zone
  fix: midday
  evidence: [same-instant, locale-only]
---

The account page formats `renewalAt` in the viewer's browser time zone, as required. This test is intended to check the date seen by a New York viewer near midnight. The project sets `locale: 'en-US'` and leaves `timezoneId` unset.

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
