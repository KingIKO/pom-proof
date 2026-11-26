---
title: Which quality metrics do you use as a lead, and which have misled you?
topic: leadership
roles: [senior, sdet]
level: senior
type: behavioral
oneLine: Pick measures tied to customer harm and delivery decisions, then show what the denominator leaves out.
looksFor:
  - A metric you selected for a specific decision
  - Why a vanity count misled the team
  - A measured outcome with context
  - Your lesson about interpreting the data
trap: Setting a target for bug counts or automation percentage and treating it as a direct measure of product quality.
followUps:
  - question: What would make a release escape rate go down for the wrong reason?
    answer: Fewer users, changes to reporting, or a shorter observation window could all reduce the count without fixing anything.
---

I inherited a team dashboard where passing test percentage was the release measure. The number stayed high through several failed exports because hundreds of unrelated cases passed. I defined a user-facing export failure rate for completed requests and tracked jobs stuck without a result separately. I asked support to sample whether failure messages gave customers a useful next step.

Those numbers changed our decision: we fixed an export retry path before writing more tests for low-risk report filters. Over the next month failed or stuck exports went from 28 of 1,400 started requests to 11 of 1,350. I learned to inspect raw counts and exposure before treating a dip as an improvement.

### Example

When the dashboard showed 98% tests passing, I brought the 16 stuck exports from that week into planning. They hadn't appeared in the completed-request metric.
