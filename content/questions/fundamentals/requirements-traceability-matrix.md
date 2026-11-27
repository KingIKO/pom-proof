---
title: The transcript deadline moves to Thursday, but the reminder still says Friday. What should link those checks?
topic: fundamentals
roles: [manual-qa, senior]
level: mid
type: concept
oneLine: Give the cutoff, reminder and any override checks a shared rule ID so a deadline change reaches them together.
looksFor:
  - Connects the Friday reminder and the Thursday cutoff to the same requirement.
  - Uses the links to spot an override with no recorded check.
  - Can follow a failed test or bug back to the rule it concerns.
  - Keeps results and links where the team will update them.
trap: Creating a separate spreadsheet that falls out of date each time a rule or test changes.
followUps:
  - question: The deadline test passes, but the reminder test last ran on the Friday build. What would you tell the release owner?
    answer: We have evidence for the form's cutoff only. I'd rerun the reminder against the Thursday build and check the date in the message.
sources:
  - label: ISTQB CTFL v4.0.1, section 1.4.4
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd put the cutoff rule ID on the reminder bug. From that ID I'd want to see the tests for the
form and the email, what each checked, and which build each ran on. If the school office has an
override and it has no test linked, I'd ask whether we have any evidence for it.

That works in both directions: a failed test points back to the rule, and changing the rule shows
which cases and bug tickets need a look. For this change, links in the requirement and test
records might be enough. I'd build a traceability matrix from those links if we needed one view
across releases or for an audit.

### Example

If transcript requests move from a Friday cutoff to Thursday, I'd follow the rule ID to the deadline
test and the late-request email check. If the admin override has no linked case, I'd ask whether that
rule changed too and add the missing check.
