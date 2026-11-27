---
title: "When would automating a weekly invoice review pay for itself?"
topic: automation-strategy
roles: [sdet, senior]
level: senior
type: concept
oneLine: "I'd estimate how many runs cover the time it takes to build the test. I'd also measure how soon the suite gives useful results."
looksFor:
  - "Use the actual time a run saves after upkeep."
  - "Include test infrastructure, maintenance, and time spent investigating false alarms."
  - "Explain what faster results could change about releases."
  - "Revisit the value of checks that rarely fail."
trap: "Counting the hours saved on manual checks without counting time spent fixing the automated ones."
followUps:
  - question: "The Friday invoice job always passes. How would you show Finance that it can catch a wrong tax total?"
    answer: "I'd give the job an invoice with a known tax mismatch. I'd check that it flags the invoice and reports the difference. If a cheaper check gives equally useful feedback on the same error, I'd consider using that instead."
---

I'd time the invoice review people do by hand. I'd count how often they run it, including repeats after fixes. Then I'd estimate how long automation takes to build and what each run costs. I'd include the machines it uses, upkeep of the test environment, false alarms, and test changes when invoice rules change. If each run saves little time, the upfront work takes longer to pay back.

I'd measure how soon the suite gives useful results. If developers get the answer before they move on, we might release more often. I'd compare that with what the team actually achieved before automation.

### Example

If a review takes 90 minutes a week, I'd compare that with the automated cost. Say it takes 12 hours to build and about 30 minutes a week to run and maintain. I'd expect to earn back the setup time around week 12 if the workload stays steady.
