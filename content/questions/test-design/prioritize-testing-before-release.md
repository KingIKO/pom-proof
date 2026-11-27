---
title: The release is two hours away. Which tests would you run first?
topic: test-design
roles: [manual-qa, sdet, senior]
level: senior
type: scenario
oneLine: I'd test failures users are likely to hit and can't recover from easily. I'd tell the release owner what I couldn't check.
looksFor:
  - Rank risks by what changed, who is likely to see it, and how a failure would affect them.
  - Choose focused checks and a quick test of the affected user flow.
  - Leave time to investigate failures and test the plan for switching back.
  - Say what you skipped and tell the release owner what you recommend.
trap: Running the usual tests in order until time runs out and reporting only the pass rate.
followUps:
  - question: What would you recommend if a test finds a serious problem near the deadline?
    answer: I'd tell the release owner what failed and who it affects. I'd recommend delaying release, or leaving the change out if we can check that plan in time.
  - question: Would you wait for every automated test to finish?
    answer: If the full suite can run alongside my focused checks, I'd start it early. I'd use the results that arrive in time. I'd report which tests were still running when the owner decided.
sources:
  - label: ISTQB CTFL v4.0.1, section 5.1.5, test case prioritization
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd ask what changed and who will use it first. I'd find out how hard it would be to recover from a failure. I'd pick the checks that give the release owner useful evidence. I'd test the changed rule directly and run a smoke test, a quick check of the affected customer flow. I'd leave time to investigate a failure.

If we plan to use a fallback, or another way to keep the feature working, I'd leave time to test it too.

Before the deadline, I'd report the results and name important paths I didn't check. I'd recommend whether to release and explain what using that evidence could mean for users.

### Example

Suppose a warehouse changes its deadline for sending orders the same day. I'd place orders just before, at, and just after the documented cutoff. I'd check the date the customer sees and follow an order into the warehouse queue. If time runs out, I'd tell the release owner which other warehouse schedules I haven't checked. If a rollout limited to the tested site is proven to work, I'd recommend that.
