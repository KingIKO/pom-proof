---
title: What runs in pull request smoke tests versus a full regression schedule?
topic: ci-git-docker
roles: [manual-qa, automation, sdet, senior]
level: mid
type: scenario
oneLine: Check the fastest critical journeys before merge and run wider combinations on a schedule with a response owner.
looksFor:
  - A plausible pull request time budget
  - Coverage chosen for the cost of finding a failure late
  - An owner for nightly or release-candidate failures
  - A plan when a scheduled check catches something
trap: Scheduling expensive checks overnight without agreeing who reads the results or what they can block.
followUps:
  - question: Do all important checks belong in the smoke suite?
    answer: I'd look for a fast signal before merge and keep an expensive, necessary check on a schedule tied to the release decision.
---

I use smoke tests to prove the build is usable enough to merge. I want fast feedback on things like signing in or completing a normal order. I'd run focused checks for the changed feature too, even if those checks aren't in the default smoke list.

Full regression can cover combinations that don't fit that feedback window, like a wider browser matrix and existing-account states. I choose the schedule based on how long a bad result can sit unnoticed. Each scheduled failure needs someone to triage it and a rule for when it blocks the next release. If a nightly check keeps finding expensive defects, I'd ask whether a smaller version belongs before merge.

### Example

I'd gate cart changes on adding an item and completing checkout. Overnight I'd run more coupon and shipping combinations, and rerun affected combinations on the release candidate.
