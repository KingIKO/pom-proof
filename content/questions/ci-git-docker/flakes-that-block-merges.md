---
title: "A test sometimes fails and blocks a merge. What should happen next?"
topic: ci-git-docker
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: "I check whether the first failure could be a product bug. If I make an exception, I limit it to that test and track the repair."
looksFor:
  - "Review the first failure before letting anyone bypass the check."
  - "Base the release decision on what the test should catch."
  - "Name who approved the exception and what evidence will replace the check for now."
  - "Set an end date and say what must pass before the check is required again."
trap: "Rerunning until tests pass or dropping all required browser checks because one test fails sometimes."
followUps:
  - question: "Would you quarantine a checkout test if you can't explain the failure?"
    answer: "I'd keep the risk visible and ask the release owner to decide based on direct evidence from another check. I wouldn't call it a test problem without evidence."
---

I look at the first failure and name the behavior the test checks. If checkout sometimes confirms the wrong price, a passing retry doesn't remove the product bug. I'd keep the failure visible to the release owner. If the evidence shows a problem in test setup, I'd consider keeping the other merge checks required while someone fixes that test.

Quarantining a test means temporarily taking it out of the required checks. If we make that exception, I record the cause and the behavior no longer covered by a required check. I name the person who approved it and what we'll test instead. I give the exception an end date and keep running the test separately when possible. Before restoring it, I check the repair under the same conditions in continuous integration (CI), where jobs run automatically.

### Example

If two jobs save screenshots to the same path, I'd keep the normal checkout test required. I'd temporarily remove only the affected snapshot check, which compares a saved image with what the browser shows.
