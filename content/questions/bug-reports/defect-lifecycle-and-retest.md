---
title: "What happens to a defect from the time you report it until you close it?"
topic: bug-reports
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: "I report the defect, a problem in the product, and track what the team decides. If someone fixes it, I test a build with the fix before I mark it verified."
looksFor:
  - "Explain how a filed report reaches the people who decide what to do next."
  - "Describe outcomes besides a fix, including duplicate reports and issues the team decides to handle later."
  - "Repeat the original steps in a build that includes the fix."
  - "Explain how to record a failed retest or file a separate problem the change caused."
trap: "Treating a fixed ticket as proof that the bug is gone."
followUps:
  - question: "What if the original steps work but you find another problem nearby?"
    answer: "I'd record that the original bug passed its retest. I'd file the new bug with its own steps and impact, and link the tickets."
  - question: "What if the fix isn't in the test environment yet?"
    answer: "I'd record which build is available. I'd leave the fix unverified until I can try a build that includes it."
sources:
  - label: ISTQB CTFL syllabus, section 5.5 (Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I start with a report someone else can act on. In triage, the team decides what to do about the report. We might assign someone to fix it, link a duplicate, or explain why the issue can wait. The status names and who updates them vary by team.

When a fix is ready, I check which build includes it. I repeat the original steps and check one related behavior the change could affect. If the original problem still happens, I send the ticket back with new evidence from that build.

### Example

Suppose I turn off weekly reminders and see the switch turn back on after I reload. In the build with the fix, I'd turn them off, reload, and sign in again. I'd check that they stay off. I'd turn them back on to see if that setting still saves. If those checks pass, I'd record the build and results before marking the fix verified.
