---
title: School staff like the new attendance app in a demo. What evidence would you ask for before rollout?
topic: fundamentals
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: Separate acceptance of the attendance workflow from evidence about how it behaves away from the demo.
looksFor:
  - Starts with a claim that the demo cannot establish.
  - Uses intended users to make an acceptance decision.
  - Changes the environment to answer different questions in alpha and beta.
  - Traces a late functional failure to a missing check or condition.
trap: Promoting a successful trial of the demo flow to evidence that the school can adopt it.
followUps:
  - question: A school doesn't use the sample attendance categories. Who resolves that?
    answer: I'd ask its attendance lead to confirm the categories needed for their daily report and record whether those are required for acceptance.
sources:
  - label: ISTQB glossary v4.6.2, acceptance and alpha and beta testing (Swedish Software Testing Board)
    url: https://sstb.se/wp-content/uploads/2025/12/Glossary-CTFL-4.0-ENSV-2025-12-11.pdf
---

A teacher can mark a pupil absent in the demo. Can the attendance office correct a register and
still submit its daily report? I'd put that task in user acceptance testing (UAT) with the staff
who will do the work. I'd ask the school to name who records whether the new workflow is acceptable.

I'd use different settings to answer different questions. In an alpha, school staff can try our
prepared register in the development team's test environment while we observe. In a beta, a
school tries the app at its own site. I'd compare the two reports before expanding the trial.

### Example

I'd ask the office to correct a sample pupil marked absent and confirm the revised report meets its
needs. If that same correction disappears at a beta school, I'd capture the conditions and add
an earlier check for whatever the demo or alpha didn't exercise.
