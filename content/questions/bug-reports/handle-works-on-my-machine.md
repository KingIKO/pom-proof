---
title: How do you handle a bug report returned with “works on my machine”?
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Compare the passing and failing setups, reproduce together if needed, and update the report with the condition that separates them.
looksFor:
  - Treat the passing run as evidence about that setup.
  - Compare build, permissions, and relevant test data before trying unrelated changes.
  - Reproduce with a shared test setup or a short paired session.
  - Update the original ticket with a working reproduction and the affected group.
trap: Reopening the same report unchanged or closing it because a developer's run passed.
followUps:
  - question: What if both setups appear identical on paper?
    answer: I'd pair on a clean run with approved test accounts. We'd watch each step and compare what the app actually reports about the account and environment.
---

I'd start by asking what build and type of account passed. Then I'd put that next to the conditions from my failed run. If the difference isn't obvious, I'd offer to reproduce it together with the same test data. When we find a likely difference, I'd rerun both conditions on one build so we can tell whether it matters. Then I'd update the original ticket so the next person can start there.

### Example

A team member with upload permission can't import a vendor CSV, while the developer can import the same file. The developer is signed in as a workspace owner. On the same staging build, we retry with an owner and a regular member whose upload permission is enabled. The member gets “Access denied” and the owner succeeds. I add both outcomes and the permission setting to the ticket. The developer now has a failing case to use without needing my account.
