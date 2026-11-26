---
title: How do you make a go or no-go recommendation for a risky release?
topic: agile
roles: [senior, sdet]
level: senior
type: scenario
oneLine: Give the release owner a clear recommendation backed by test evidence, customer impact, and a verified fallback if one exists.
looksFor:
  - Tie evidence to the candidate build and say what was not exercised.
  - Describe the consequence of a failure in terms of affected customers.
  - Check that a fallback isolates the risk and consider lasting side effects.
  - Name who decides and what signal would stop or reverse a rollout.
trap: Recommending go based on a high pass rate without weighing a single failure with serious customer impact.
followUps:
  - question: Would you ship if the risky path is behind a flag?
    answer: Only if we can verify the disabled path prevents the risky behavior in the release configuration and we have checked any shared code or data changes.
  - question: What if a rollback cannot undo the harm?
    answer: I separate stopping new harm from fixing what's already happened. If we can't prevent the failure and don't have a recovery plan for affected customers, I'd recommend holding the release.
---

I'd bring a recommendation to whoever owns the release decision. It should say what I tested on the candidate build, what I couldn't test, and what a failure would cost a customer. A reproducible double charge outweighs a long list of passing checkout checks.

If the release has other useful changes, I'd ask whether we can ship them with the risky path off. I'd check that the setting takes effect and that anything shared by the two paths still works. On a later rollout, I'd ask the on-call lead to watch for a second charge on a single-payment order and turn off the new flow if that happened. Rolling back code won't refund anyone who was already charged.

### Example

In staging, retrying after a payment timeout charged the test customer twice. I recommended holding the new checkout flow. We verified that disabling it routed shoppers through the existing flow and that the same retry case charged once. The release owner shipped the unrelated fixes with the new flow off and kept it off until we could verify the corrected retry behavior.
