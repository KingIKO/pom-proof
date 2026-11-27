---
title: Two CI jobs share one sample roster. How would you split the investigation?
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Establish the correct transfer result and check whether another job overwrote the roster used to test it.
looksFor:
  - Distinguishes a changed export from a changed fixture.
  - Explains what the school office expects after a transfer.
  - Gives each parallel run independent data and verifies the fix.
  - Leaves room for the two roles to share the work and review.
trap: Treating the title as a seniority ranking or assuming QA engineers never write code.
followUps:
  - question: The CI failures stop when only one job runs. What would you want to see before closing the ticket?
    answer: I'd run both jobs together with separate sample rosters and check each export for its own transferred student.
sources:
  - label: ISTQB CTFL v4.0.1, sections 1.4.5 and 1.5.2, role variation and shared quality
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd ask whether both jobs exported the rosters they started with. One person can trace what
the runner seeded while the other checks which class the roster should list after a transfer.
Then they can compare what they found to see whether the export or the test data changed.

If the software development engineer in test (SDET) owns the runner on this team, I'd ask them
to review the fixture fix. The QA engineer can supply the transfer case and own the shared check
with them. Someone who mostly tests by hand could pair on the fixture change as a first step
into maintaining test tooling. The titles don't dictate the split on every team.

### Example

If two jobs share the same sample roster, I'd have one person verify the transfer scenario while
the other makes the test data independent. A tester moving into SDET work could take on that data
change and prove both jobs pass in parallel.
