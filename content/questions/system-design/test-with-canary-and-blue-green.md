---
title: The renewal canary has fewer errors but fewer invoices too. Would you send it more traffic?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Hold traffic until renewal outcomes agree, and rehearse whether the previous build can handle the new writes.
looksFor:
  - Checks invoices per eligible renewal before using error counts to judge the canary.
  - Rehearses routing an in-flight account back to the previous build.
  - Checks that both builds can use the added attempt column without losing a renewal.
  - Explains whether the next traffic move is a larger cohort or a full blue-green switch.
trap: Treating a successful switch back to the old build as proof that the database rolled back with it.
followUps:
  - question: The chosen cohort has no renewals due until tonight. Would a quiet hour earn the next traffic increase?
    answer: I'd hold the cohort at its current size until enough eligible renewals are due to evaluate invoice outcomes. An hour without eligible accounts tells me nothing about renewal success.
sources:
  - label: Google SRE workbook on canaries and blue-green deployment
    url: https://sre.google/workbook/canarying-releases/
  - label: Azure Well-Architected Framework on rollout health and stateful recovery
    url: https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments
---

I'd hold the rollout and compare invoices per eligible renewal across the current and
candidate builds. I'd automate that check along with duplicate invoices, errors, and latency.
I'd use absolute targets as well, since both builds can share a failing dependency.

With a canary I'd keep the cohort small until that evidence supports the next step. A
blue-green deployment gives me two environments to switch between, but the switch won't undo
database writes. Before either rollout I'd rehearse sending traffic back and prove the
previous build can handle those writes and any renewal already in progress.

### Example

Suppose the new build records renewal attempts in an added column. I'd let a small cohort
through, check that eligible accounts get one renewal and one invoice each, then route that
cohort back in a rehearsal. The previous build should still read and renew those accounts.
