---
title: When would automating a weekly invoice review pay for itself?
topic: automation-strategy
roles: [sdet, senior]
level: senior
type: concept
oneLine: Estimate how many runs recover the initial cost, then measure the feedback the suite provides.
looksFor:
  - Uses the time actually saved on each run.
  - Budgets for upkeep, infrastructure, and false alarms.
  - Explains why earlier results matter for releases.
  - Reassesses checks that seldom fail.
trap: Counting gross manual hours saved while ignoring time spent repairing the suite.
followUps:
  - question: The invoice job has been green every Friday. How would you show Finance it still catches a wrong tax total?
    answer: I'd feed it a sample invoice with a known tax mismatch and check that the job flags the invoice and reports the difference. If a cheaper check catches the same error with equally useful feedback, I'd consider moving that coverage.
---

I'd time the current manual review and count how often the team runs it, including the repeats after fixes. Then I'd estimate build time and the cost per automated run: compute, environment upkeep, investigating flaky failures, and changing tests as invoice rules move. If there isn't much time left over per run, the investment takes longer to pay back.

I'd track time to useful feedback separately. An invoice check that finishes before developers move to another task might let us release more often. I'd compare those outcomes with what the team actually achieved before the change.

### Example

A review takes 90 minutes each week. Automation costs 12 hours to build and about 30 minutes a week to run and maintain. It earns back the initial time at roughly week 12, assuming the workload stays steady.
