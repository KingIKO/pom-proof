---
title: What should happen when an intermittent test blocks a merge?
topic: ci-git-docker
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: Triage the failure as product risk first, then limit any exception to the diagnosed check and track recovery.
looksFor:
  - Triage from first-try evidence before allowing a bypass
  - A release decision based on what the test protects
  - A named approval and temporary alternate evidence
  - A deadline and condition for restoring the check
trap: Retrying until green or removing all required browser checks because one case fails intermittently.
followUps:
  - question: Would you quarantine a checkout test if you cannot explain the failure?
    answer: I'd keep the risk visible and ask the release owner to decide using direct alternate evidence. I wouldn't label it test noise without support.
---

I look at the first failure and ask what contract the check protects. If the checkout sometimes confirms the wrong price, it's still a product bug when the retry passes. I'd keep that failure visible to the release owner. If the evidence shows a broken test setup, I'd consider letting the rest of the gate stand while the owner repairs that specific check.

For an exception, I record the cause, the exposed behavior, the approver, and the alternate coverage. I put an expiry on it and keep the test visible outside the gate when possible. Then I verify the repair under the original CI conditions before restoring it.

### Example

If a screenshot path collides between jobs, I'd require the normal checkout check and move only the affected snapshot check out of the gate temporarily.
