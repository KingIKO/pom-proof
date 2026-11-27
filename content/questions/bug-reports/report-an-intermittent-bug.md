---
title: "How do you report an intermittent bug you can't reproduce on demand?"
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I report how often it failed in my tests. I compare a pass with a failure before changing one suspected trigger at a time."
looksFor:
  - "Record failed and passing attempts along with the build and setup."
  - "Keep a passing attempt to compare with a failure."
  - "Say which triggers you suspect and which causes you have verified."
  - "Explain the impact and what evidence you'd collect next."
trap: "Calling it random without run details or claiming a race condition just because the bug is intermittent."
followUps:
  - question: "What if the problem stops happening after the team deploys a new build?"
    answer: "I'd report how many times I tried on the new build and under which conditions. I'd keep the old evidence. The passing runs alone wouldn't prove it's fixed."
  - question: "Would you file a report after seeing the failure just once?"
    answer: "Yes, if the harm warrants a report. I'd say I saw it once and attach the evidence I have. I'd leave the rate and cause open."
---

An intermittent bug happens on some attempts and not others. I'd file the report with the evidence I have. I'd say how many attempts failed out of how many I ran. That rate describes the setup I used. I'd save a pass and a failure from that same setup.

I'd change one thing at a time to look for a repeatable trigger and keep the original evidence. A race condition is a bug that depends on the timing or order of actions. I'd need more evidence than an occasional failure to claim that.

### Example

In a store search, I typed “coat” and quickly replaced it with “boots.” In 4 of 20 attempts in the test environment, the results still showed coats under a “boots” search box. I saved the screen and the order the replies arrived in for one pass and one failure. The coat reply arrived last in the failing run.

I'd report that as a clue. I'd run the same search again with a delay on only the first reply. I'd see if changing the reply order changes the result.
