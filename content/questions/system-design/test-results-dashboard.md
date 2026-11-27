---
title: The checkout dashboard shows 99 percent green, but the receipt shard is missing. What should it say?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Make it obvious what changed, which result is missing, and who has the next action.
looksFor:
  - Makes a missing shard visible before counting any outcomes.
  - Gives a new receipt failure and an acknowledged failure different next actions.
  - Keeps the first attempt and links it to the exact test build and evidence.
  - Defines the denominator for retry recoveries and shows changes that need attention.
trap: Showing a green percentage while hiding skipped tests and cases that passed only on retry.
followUps:
  - question: The late receipt report comes in with a pass on retry. Does the dashboard clear the failure?
    answer: It can mark the shard as received. I'd keep the first-attempt failure visible and count the recovery separately from a clean pass.
sources:
  - label: Playwright retry outcome categories
    url: https://playwright.dev/docs/test-retries#retries
---

I'd start with one question: can we trust that every required test reported? I'd show a missing
shard separately. Then I'd route a fresh failure to the person who owns the affected checkout
step and link the first attempt's trace, environment, and exact build. An acknowledged failure
can link to the open issue, with its retry result still visible.

I'd report how many completed, retry-enabled tests recovered on retry, alongside the denominator.
I'd flag a growing wait for a usable CI result and a quarantine that has outlived its review
date. I'd leave out a single overall pass percentage: it can rise after a shard goes missing.

### Example

A checkout run shows a new receipt failure, and its companion quarantine job reports a known
browser timeout. The receipt's first attempt links to a trace and build number. The timeout
links to its 12-day-old ticket, so those failures go to different owners.
