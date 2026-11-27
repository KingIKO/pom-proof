---
title: The checkout dashboard shows 99 percent passing, but the receipt shard is missing. What should it show?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: I'd show what's changed and which result is missing. I'd say who should act next.
looksFor:
  - Show any missing test group before counting outcomes.
  - Give a new receipt failure a different next step from one the team already knows about.
  - Keep the first attempt and link to the exact build and evidence.
  - Say what total you use to calculate retry recovery rates and show changes someone should investigate.
trap: Showing a pass rate that hides skipped tests and tests that only passed on retry.
followUps:
  - question: The late receipt report shows a pass on retry. Would you remove the earlier failure from the dashboard?
    answer: The dashboard can mark the shard as received. I'd keep the first failure visible and count the retry pass separately from a first-attempt pass.
sources:
  - label: Playwright retry outcome categories
    url: https://playwright.dev/docs/test-retries#retries
---

I'd check whether every required test reported. I'd show a missing shard, a group of tests run in one job, separately. I'd send a new failure to the person who owns that checkout step. I'd link the first run's trace, a recording of what happened, and show its environment and exact build. If the team already knows about the failure, I'd link the open issue and still show the retry result.

I'd count how many tests passed on retry out of all completed tests that allow retries. I'd flag a growing wait for a usable CI result, the outcome of the automated test run. I'd also flag overdue reviews for quarantined tests, known failures run separately. I'd avoid a single pass rate because it can rise when a shard goes missing.

### Example

If checkout has a new receipt failure, I'd link the first attempt's trace and build number. If the separate quarantine job reports a known browser timeout, I'd link its 12-day-old ticket. I'd send the two failures to their respective owners.
