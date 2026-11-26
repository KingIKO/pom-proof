---
title: How would you prioritize testing when a release is two hours away?
topic: test-design
roles: [manual-qa, sdet, senior]
level: senior
type: scenario
oneLine: Use the time on failures users are likely to hit and cannot easily recover from, then give the release owner an explicit view of what remains.
looksFor:
  - Ranks risks using the change, likely exposure, and impact on users.
  - Picks targeted checks plus a smoke test of the affected user workflow.
  - Reserves time to investigate a failure and test the agreed fallback.
  - Names the skipped checks and gives the decision owner a recommendation.
trap: Running regression tests in their usual order until time runs out and reporting only the pass rate.
followUps:
  - question: What if a high-impact case fails late in the window?
    answer: I'd tell the release owner what failed and who is affected, then recommend holding the release or excluding the change if we can verify that fallback in time.
  - question: Would you wait for the full automated suite?
    answer: I'd start it early if it can run alongside the focused checks. I'd use any results that arrive in time and report what was still running when the decision was made.
sources:
  - label: ISTQB CTFL v4.0.1, section 5.1.5, test case prioritization
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd ask what changed, who will hit it first, and how hard it would be to recover if it goes wrong. Then I'd pick the few checks that can give the release owner useful evidence. I'd test the changed rule directly and run a short smoke test that takes the customer through the affected flow. I'd keep some time to investigate a failure and check any fallback we plan to rely on.

Before the deadline, I'd report what passed, what failed, and which meaningful paths we skipped. I'd give a release recommendation with the consequence of shipping on that evidence.

### Example

A warehouse is changing its same-day dispatch cutoff. I'd check orders immediately before, at, and after the documented cutoff, then follow an order through the customer promise and warehouse queue. If there isn't time to check secondary warehouse schedules, I'd tell the release owner which sites are still unverified and recommend limiting the rollout to the site we tested if that option has been verified.
