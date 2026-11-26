---
title: What would you include in a bug report so someone else can reproduce it?
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Give the next person the setup, steps, expected and actual results, and enough evidence to see the impact.
looksFor:
  - Title the report with an observable symptom and the condition that triggers it.
  - Include the build and the setup another person needs to reproduce the issue.
  - Separate what happened from what was supposed to happen and cite the source of the expectation.
  - Include useful, redacted evidence and describe the impact you observed.
trap: Attaching a screenshot without the setup that produced it, or putting an untested cause in the title.
followUps:
  - question: Would you include every step you took to discover it?
    answer: I'd rerun a shorter sequence from a known starting point. If removing a step makes the failure disappear, that step becomes part of the setup or repro.
sources:
  - label: ISTQB CTFL syllabus, section 5.5 (Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I write the title so someone can tell which action failed. Then I give them the build, starting state, and the smallest set of steps I've rerun. I put expected and actual results on separate lines and link the requirement behind the expectation. If I attach a file, I check that it uses test data and shows the symptom. I'd also say what the failure prevented me from doing.

### Example

My title might be “Open-only invoice export includes paid rows.” On staging build 312, use a test vendor with one open and one paid invoice. Go to Invoices, select Open, and click Export current view. The release ticket says the export should include only the open invoice. The screen shows one row, but the downloaded file contains both. I reproduced it twice and attached the redacted file. A vendor using it as a payment list could pay an invoice twice.
