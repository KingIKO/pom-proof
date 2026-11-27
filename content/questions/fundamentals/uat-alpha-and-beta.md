---
title: School staff like the demo of the new attendance app. What would you check before more schools start using it?
topic: fundamentals
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: I'd find out whether staff can do their attendance work with the app. I'd also check how the app behaves outside the demo.
looksFor:
  - Name a question the demo can't answer.
  - Ask the people who will use the app to help decide whether it meets their needs.
  - Use different places to test in the alpha and beta trials to learn different things.
  - Trace a late failure in how the app works to a test or condition you missed.
trap: Treating a successful demo as proof that the school can use the app for its daily work.
followUps:
  - question: If a school doesn't use the attendance categories in the demo, who decides which ones it needs?
    answer: I'd ask the school's attendance lead which categories the daily report needs. I'd record whether the school requires those categories before it will accept the app.
sources:
  - label: ISTQB glossary v4.6.2, acceptance and alpha and beta testing (Swedish Software Testing Board)
    url: https://sstb.se/wp-content/uploads/2025/12/Glossary-CTFL-4.0-ENSV-2025-12-11.pdf
---

A teacher can mark a pupil absent in the demo. I'd ask whether the attendance office can correct its attendance list and still submit the daily report. I'd put that task in user acceptance testing (UAT). That's where the staff who will use the app try it to see whether it meets their needs. I'd ask the school to name who records whether the new way of working is acceptable.

I'd test in different settings to learn different things. In an alpha trial, school staff can try a prepared attendance list in the development team's test setup while we watch. In a beta trial, I'd have a school try the app at its own site. I'd compare the two reports before inviting more schools.

### Example

I'd ask the office to correct a sample record for a pupil marked absent. I'd ask staff whether the revised report meets their needs. If that correction disappears at a beta school, I'd record what was different about that trial. I'd add an earlier check for the condition the demo or alpha missed.
