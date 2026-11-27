---
title: How did you get a shipping team to act on red builds it had learned to ignore?
topic: leadership
roles: [sdet, senior]
level: senior
type: behavioral
oneLine: Make a red result tell the team which failure needs action and who can investigate it.
looksFor:
  - Uses recent failures to find why the team ignores the signal.
  - Chooses a small intervention that makes real regressions easier to spot.
  - Measures whether the team handles red builds differently.
  - Leaves an operating agreement the team can use without the SDET.
trap: Making every red check mandatory before the team knows how to interpret the failures.
followUps:
  - question: How did you know an unchecked rerun was different from a legitimate rerun?
    answer: We recorded the first failure and classified it. A retry after a known outage was fine; clicking rerun with no diagnosis didn't count as resolving it.
---

I joined a shipping team that reran its red builds before anyone read the failure. In my first
90 days I wanted a red result the developers could act on during their own release shift.
I sat with the release engineer and looked at 20 first failures. Twelve happened before the
application received a label request because parallel jobs shared a test account.

We gave each job its own account and left the runner in place. I paired with a developer
to make setup failures show up separately from failed label checks. Then we agreed the
release engineer would classify the first failure and page the owner of the failing service
if the label check itself failed.

### Example

Over the next 20 runs, setup failures fell from twelve to one. When a new carrier response
left the label blank, the release engineer stopped the rollout on the first red run and
reached the shipping service owner without waiting for me.
