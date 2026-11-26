---
title: How do you measure flakiness without making the numbers misleading?
topic: flaky-tests
roles: [automation, sdet, senior]
level: senior
type: concept
oneLine: Define the numerator and denominator, preserve first-attempt outcomes, and compare runs with the same retry policy.
looksFor:
  - Logical test executions as the denominator rather than retry attempts
  - What failure then pass can and cannot establish
  - Separation of infrastructure failures and missing attempts
  - A sample size and a time window
trap: Reporting final pass percentage as reliability or comparing weeks with different retry settings.
followUps:
  - question: What if only failed jobs were retried in one period?
    answer: I'd separate that period and report retry eligibility and completion, since its observed recovery rate isn't directly comparable.
---

I'd report how many logical executions fail the first time and later pass on the same revision, divided by the executions started under the same retry policy. Each test and browser combination counts once per run, rather than once per attempt. I'd publish counts alongside percentages and show first-attempt failures separately. An execution with no retry outcome can't be classified as a recovered flake.

I break the data down by test, browser, and environment. That helps separate a noisy check from a bad runner day. Even a documented failure followed by a pass doesn't identify whether the cause is a test race, infrastructure, or the app.

### Example

If 12 of 400 executions fail first and pass on retry, I'd report 3% observed retry recovery and say how many failed all attempts. I'd include the time window and identify any cancelled runs separately.
