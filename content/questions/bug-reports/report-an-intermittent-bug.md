---
title: How do you report an intermittent bug that you can't reproduce on demand?
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Report the observed failure rate and compare passing and failing attempts before changing one suspected trigger at a time.
looksFor:
  - Log both failures and attempts with the build and test conditions.
  - Capture a passing attempt alongside a failing one for comparison.
  - Separate a suspected trigger from a cause that has been confirmed.
  - Report the impact and what evidence would make the next attempt useful.
trap: Writing “random” with no run details, or claiming a race condition because the issue is intermittent.
followUps:
  - question: What if the problem stops happening after a deploy?
    answer: I'd state how many attempts I ran on the new build and under which conditions. I'd keep the earlier evidence and avoid calling it fixed on that basis alone.
  - question: Would you file the ticket after only one failure?
    answer: Yes, if the impact warrants it. I'd say I observed it once, attach the available evidence, and leave the frequency and cause open.
---

I'd file it with the evidence I have, including how many attempts failed out of how many I actually ran. That rate belongs to those test conditions. Then I'd save a failing attempt and a passing one from the same setup. I'd vary one thing at a time to find a more reliable trigger without erasing the original evidence.

### Example

In a store search, I typed “coat” and quickly replaced it with “boots.” In 4 of 20 staging attempts, the final results still showed coats under a “boots” search box. I captured the screen and the response order for one pass and one failure. In the failing run, the coat response arrived last. I'd report that as a clue. Next I'd repeat the sequence with a controlled delay on only the first response and check whether reversing that order changes the result.
