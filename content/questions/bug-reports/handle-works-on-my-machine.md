---
title: "What do you do when a developer says a bug works on their machine?"
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I compare the setup that passed with the one that failed. If needed, I repeat both cases with the developer and record what separates them."
looksFor:
  - "Treat the passing run as evidence about that setup."
  - "Compare the build, permissions, and test data before trying unrelated changes."
  - "Use the same test setup or run through the case together."
  - "Update the original ticket with repeatable steps and say who is affected."
trap: "Reopening the report without new details or closing it because a developer's test passed."
followUps:
  - question: "What if both setups look the same on paper?"
    answer: "I'd run the test with the developer from a clean starting point using approved test accounts. We'd compare what the app reports about each account and setup as we go."
---

I'd ask which build and account type worked. I'd compare those details with my failed run. If I can't see a difference, I'd ask to run the test together with the same test data. If we find a likely difference, I'd try both setups on one build to see whether it matters. I'd update the original report with what we find.

### Example

I watch a team member with upload permission try to import a vendor CSV, a file of comma-separated values. They can't import it, but the developer can import the same file. I find the developer is signed in as a workspace owner.

On the same staging build, a build used for testing before release, we test both roles. The member has upload permission but gets “Access denied.” The owner succeeds. I put both results and the permission setting in the ticket so the developer can reproduce the failure without my account.
