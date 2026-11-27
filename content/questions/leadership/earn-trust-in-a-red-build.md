---
title: How did you get a team releasing software to act on failed builds it had learned to ignore?
topic: leadership
roles: [sdet, senior]
level: senior
type: behavioral
oneLine: I make a red result show the team which failure needs action and who can investigate it.
looksFor:
  - Use recent failures to find out why the team ignores red builds.
  - Choose a small change that makes real regressions, things that used to work and now break, easier to spot.
  - Measure whether the team now handles red builds differently.
  - Leave a working agreement the team can follow without the SDET (software development engineer in test).
trap: Making every red check required before the team knows how to read the failures.
followUps:
  - question: How did you tell an unchecked rerun apart from a legitimate rerun?
    answer: I had the team record the first failure and identify what kind it was. I'd accept a retry after a known outage. I wouldn't count a rerun as a fix if nobody had looked into the cause.
---

I joined a shipping team that reran its red builds before anyone read the failure. A red build is a build whose automated checks failed. In my first 90 days, I wanted a red result that developers could act on during their own release shift.

I sat with the release engineer and looked at 20 first failures. A first failure is the original failed result, before any rerun. Twelve happened before the application received a label request. The cause was that parallel jobs, which run at the same time, shared a test account.

We gave each job its own account. We left the runner, the system that runs the jobs, in place. I paired with a developer, and together we made setup failures show up separately from failed label checks. A setup failure happens while the test prepares, before it checks a label.

Then we agreed on how to handle a red build. The release engineer would classify the first failure. If the label check itself failed, the release engineer would page the owner of the failing service. To page someone means to send them an urgent alert.

### Example

Over the next 20 runs, setup failures fell from twelve to one. When a new carrier response left the label blank, the release engineer stopped the rollout on the first red run. They reached the shipping service owner without waiting for me.
