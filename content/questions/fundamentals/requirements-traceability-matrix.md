---
title: The transcript deadline moves to Thursday, but the reminder still says Friday. What should link those checks?
topic: fundamentals
roles: [manual-qa, senior]
level: mid
type: concept
oneLine: I'd use one rule ID for the cutoff, reminder, and any checks for exceptions. I'd use that ID to find each test affected by a deadline change.
looksFor:
  - Link the Friday reminder and the Thursday cutoff to the same requirement.
  - Use the links to spot an override, or allowed exception to the rule, without a recorded test.
  - Follow a failed test or bug report back to the rule it affects.
  - Store the results and links where the team already updates them.
trap: Keeping a separate spreadsheet that nobody updates when a rule or test changes.
followUps:
  - question: If the deadline test passes but the reminder test only ran on the version with Friday's cutoff, what would you report?
    answer: I'd say that we have evidence only for the form deadline. I'd rerun the reminder test on the version with Thursday's cutoff and check the date in the message.
sources:
  - label: ISTQB CTFL v4.0.1, section 1.4.4
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd put the cutoff rule's ID, or unique label, on the reminder bug report. I'd use it to find the form and email tests. I'd check what each test covered and which version of the app it ran on. If the school office can make an exception and I see no linked test, I'd ask what evidence we have for it.

From a failed test, I'd follow the link back to the rule. If the rule changes, I'd follow its links to find the tests and bug reports to review. For this change, the links in the rule and test records might be enough. If I need to see the links across releases or for an audit, I'd put them in one table called a traceability matrix.

### Example

If the transcript deadline moves from Friday to Thursday, I'd look up its rule ID. I'd use it to find the deadline test and the email check for late requests. If the admin's exception has no linked test, I'd ask whether its rule changed too. I'd then add the missing check.
