---
title: How would you tell whether a change to defect triage is working?
topic: bug-reports
roles: [senior]
level: senior
type: scenario
oneLine: Measure the delay the change is meant to remove and sample decisions for quality before calling faster triage an improvement.
looksFor:
  - Identify the bottleneck and take a baseline before changing the process.
  - Define a useful decision and measure how long reaching it takes.
  - Compare similar groups of defects and account for tickets still waiting.
  - Check a sample for premature closure or loss of useful information.
trap: Calling triage healthier because the backlog is smaller, without checking how tickets left it.
followUps:
  - question: What if the median improves but several high-impact reports still wait days?
    answer: I'd break out that group and review the stalled reports individually. The overall median can hide the very delays we wanted to fix.
  - question: How would you handle a rush of low-impact tickets after a release?
    answer: I'd report the change in volume and compare similar impact groups before drawing any conclusion about the process change.
---

I'd start with the delay we're trying to fix. If defect reports are sitting unowned, I'd measure time from filing to a decision that names an owner and next step, or gives a reason the report needs no further work. I'd also count reports still waiting so the metric doesn't improve just because nobody picked them up. I'd sample decisions to see whether reporters can act on them.

### Example

Suppose defects from one product area often sit until the next triage meeting because nobody owns first review. I'd try a rotating reviewer for that area. If the median falls from two days to one, I'd check whether older tickets are still piling up and whether the reviewer is closing reports for missing setup without asking for it. If the review finds a pattern of premature closures, I'd fix that before expanding the rotation to other teams.
