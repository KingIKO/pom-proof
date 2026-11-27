---
title: "How would you tell whether a change to defect triage is working?"
topic: bug-reports
roles: [senior]
level: senior
type: scenario
oneLine: "I measure the wait the change should reduce. I review a sample of decisions to see if they're still useful."
looksFor:
  - "Find what causes the wait and measure it before changing the process."
  - "Define a useful decision and measure how long the team takes to make it."
  - "Compare similar reports and count reports still waiting."
  - "Check a sample for tickets closed too soon or useful information that went missing."
trap: "Calling triage better because fewer reports are waiting without checking why they left the list."
followUps:
  - question: "What if the median wait falls but several bugs with serious impact still wait days?"
    answer: "I'd report that group separately and read each stalled report. The median, the middle wait when I put the waits in order, can hide the delays we wanted to fix."
  - question: "How would you handle many low-impact reports arriving right after a release?"
    answer: "I'd show how the number of reports changed. Before drawing a conclusion, I'd compare groups of reports with similar impact."
---

I'd start with the delay we're trying to fix. Triage is when the team decides what to do with a bug report. If reports sit without an owner, I'd measure the time from filing to a decision. A useful decision names an owner and a next step or explains why the report needs no more work.

I'd count reports still waiting, so the metric can't look better just because nobody picked them up. I'd check some decisions to see whether the people who filed the reports can act on them.

### Example

Suppose I find reports in one area often sit until the next triage meeting because nobody owns the first review. I'd try taking turns as reviewer for that area. If the median falls from two days to one, I'd check whether older reports still pile up. I'd also see whether the reviewer closes reports for missing setup details without asking for them. If I find reports are regularly closed too soon, I'd fix that before expanding the rotation to other teams.
