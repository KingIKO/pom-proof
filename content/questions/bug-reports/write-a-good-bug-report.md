---
title: "What goes in a bug report so another person can repeat the failure?"
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I give them the setup and steps I used. I show what happened, what I expected, and why the difference matters."
looksFor:
  - "Name the visible problem and when it happens in the title."
  - "Include the build and setup someone else needs."
  - "Separate the actual result from the expected one and link the rule behind it."
  - "Remove sensitive details from the evidence and describe the harm you saw."
trap: "Attaching a screenshot without the setup or putting an untested cause in the title."
followUps:
  - question: "Would you include every step you took before you found the bug?"
    answer: "I'd try a shorter set of steps from a known starting point. If leaving a step out makes the problem go away, I'd keep it in the setup or the steps to repeat the bug."
sources:
  - label: ISTQB CTFL syllabus, section 5.5 (Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I write a title that tells someone which action failed. I give them the build, the starting setup, and the shortest set of steps I've rerun. I put the expected and actual results on separate lines. I link the requirement that says what should happen. If I attach a file, I use test data and check the file shows the problem.

I describe what the failure kept me from doing so the team can judge the impact.

### Example

I'd title the ticket “Open-only invoice export includes paid rows.” On staging build 312, I use a test vendor with one open and one paid invoice. I go to Invoices, select Open, and click Export current view. I expect only the open invoice because that's what the release ticket says.

I see one row on screen, but the download contains both. I reproduce the failure twice and attach the file after removing sensitive details. I'd note that a vendor using it as a payment list could pay an invoice twice.
