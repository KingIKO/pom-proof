---
title: What happens to a defect from the time you file it to the time you close it?
topic: bug-reports
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: Record the finding, track the team's decision, and verify the fix in a build that contains it before marking it verified.
looksFor:
  - Describe the handoff from a reported finding to a triage decision.
  - Allow for duplicate, deferred, and other outcomes besides a fix.
  - Retest the original reproduction in a build that contains the fix.
  - Explain how to record a failed retest or a separate regression.
trap: Saying that moving a ticket to fixed proves the original issue is gone.
followUps:
  - question: What if the original steps pass, but you find a different failure nearby?
    answer: I'd record that the original issue passed retest, then file and link the new failure with its own steps and impact.
  - question: What if the test environment doesn't have the fix yet?
    answer: I'd note which build is available and leave verification pending until I can test one that includes the fix.
sources:
  - label: ISTQB CTFL syllabus, section 5.5 (Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I start with a report the team can act on. In triage, we might assign a fix, link a duplicate, or defer the issue and record why. The status names and who changes them vary by team. When a fix is ready, I check which build contains it, run the original steps, and check a related path the change could affect. If the original issue still happens, I send the ticket back with fresh evidence from that build.

### Example

Say turning off weekly reminders looks successful, but the switch is back on after a reload. On the patched build, I'd turn reminders off, reload, then sign in again and check that they stay off. I'd also turn them back on to make sure the other direction still saves. If those checks pass, I record the build and results before marking the fix verified.
