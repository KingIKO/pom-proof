---
title: "When would you quarantine a flaky test?"
topic: flaky-tests
roles: [automation, sdet, senior]
level: mid
type: scenario
oneLine: "I temporarily take out a test only when the evidence points to the test or setup. I keep it running if possible and name who'll fix it and when."
looksFor:
  - "Show why you think the failure comes from the test or setup rather than the product."
  - "Name the owner, ticket, and date to review the fix."
  - "Keep test results visible while the check is out."
  - "Cover the risk another way until the fix is ready."
trap: "Skipping the test with no end date and no record of what it used to check."
followUps:
  - question: "What would make you require the quarantined test again?"
    answer: "I'd check that the repair addresses the cause and passes repeatedly under the original conditions. I'd prove the test still catches the wrong result."
  - question: "You quarantined the CSV check yesterday. Another team wants to require a new PDF download check today. What do you do before release?"
    answer: "I'd run the PDF check repeatedly next to the other downloads on the same CI workers before requiring it. I'd read the quarantine log for recurring failures. I'd compare what release risks we'd miss. If the CSV tests often interfere during cleanup and that leaves a risk, I'd fix it first."
---

A flaky test sometimes passes and sometimes fails under the same conditions. I quarantine a test by temporarily taking it out of the merge gate, the checks that must pass before code can merge. I do this when evidence points to the test or setup and repeated failures make people ignore the gate. If the intermittent behavior can harm a customer, I treat it as a product risk and tell the person who owns the release decision.

If possible, I keep the test running separately. I name an owner, file a ticket with the first failure, and set a date to review it. I record what used to check that behavior and what's covering it during the repair. If nobody reads the results, keeping the test is little different from deleting it.

### Example

If two tests try to clean up the same exported file, I'd give the owner two days to separate the download folders. I'd keep the check that calls the export service directly as a required check. Until the fixed test returns, I'd manually check browser downloads on the build we plan to release.
