---
title: The renewal canary has fewer errors but fewer invoices too. Would you send it more traffic?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: I'd wait for renewal outcomes to match before sending more traffic. I'd test whether the previous build can handle the new writes.
looksFor:
  - Check invoices per eligible renewal before judging the canary by error counts.
  - Practice sending an account with a renewal in progress back to the previous build.
  - Check that both builds handle the added attempt column without losing a renewal.
  - Explain whether the next step is a larger canary group or a full blue-green switch.
trap: Assuming the database undid its writes because you sent traffic back to the old build.
followUps:
  - question: The test group has no renewals due until tonight. Would you send more traffic after an hour with no errors?
    answer: I'd keep the group the same size until enough eligible renewals come due to judge invoice outcomes. An hour without eligible renewals tells me nothing about renewal success.
sources:
  - label: Google SRE workbook on canaries and blue-green deployment
    url: https://sre.google/workbook/canarying-releases/
  - label: Azure Well-Architected Framework on rollout health and stateful recovery
    url: https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments
---

I'd pause the rollout and compare invoices per eligible renewal in the current and new builds. I'd automate that comparison and the check for duplicate invoices. I'd also automate checks for errors and latency, or response time. I'd set limits that each build has to meet on its own because both could depend on the same failing service.

A canary rollout sends a small share of traffic to the new build. I'd keep the canary group small until the results support sending it more traffic. A blue-green deployment gives me two environments I can switch between. Switching environments won't undo database writes.

Before either rollout, I'd practice sending traffic back. I'd confirm that the previous build handles new writes and any renewal already in progress.

### Example

Suppose the new build saves renewal attempts in an added column. I'd give it a small group of accounts. I'd check that each eligible account gets one renewal and one invoice. I'd send the same group back in a practice run. I'd check that the previous build can still read and renew those accounts.
