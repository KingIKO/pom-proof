---
title: How do you investigate a defect that escaped to production and keep it from recurring?
topic: bug-reports
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Contain the customer impact, then find both the condition that caused the failure and the gap that let it ship.
looksFor:
  - Assess the scope of harm and coordinate an immediate containment decision.
  - Reproduce the failure with safe data and verify the proposed cause.
  - Explain why the existing checks passed despite the defect.
  - Assign a prevention action and show the new check catches the old failure.
trap: Ending the review at “QA missed it” or counting a new test without proving it would have caught the defect.
followUps:
  - question: What if you can't reproduce it in staging?
    answer: I'd compare production and staging inputs and configuration with the team. I'd preserve the observed evidence, label the cause as open, and still pursue any warranted containment.
  - question: How do you choose where the regression test goes?
    answer: I'd put the main check where it can reproduce the failure reliably. I'd add a higher-level check only if the connection between components could fail in a way that test can't see.
---

I'd start with who is affected and what we can do to limit more harm. Then I'd work with engineering to reproduce the failure with safe data. I'd keep two questions open until we can answer them with evidence: what caused the bad result, and why did our release checks pass? Each prevention action needs an owner and a way to prove it works.

### Example

Say monthly usage reports omit some of the last day's usage for customers west of UTC. I'd ask the release owner to pause the remaining sends while we work out which reports need replacing. A controlled replay shows the query uses a UTC cutoff where the report calls for the customer's local cutoff. Our fixtures used only UTC accounts, where both cutoffs match. I'd add a New York account with records just before and just after local midnight at the end of the month. I'd show that the same report check fails before the fix and passes after it.
