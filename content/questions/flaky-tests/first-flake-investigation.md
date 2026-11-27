---
title: "A test passes on your machine but sometimes fails in CI. What do you do?"
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: scenario
oneLine: "I save the first failure and match the automated run's setup. I change one suspected cause at a time."
looksFor:
  - "Keep the evidence from the first failure."
  - "Record the code version, test data, and settings of the job that failed."
  - "Repeat the failure changing one condition at a time."
  - "Show that the repaired check still catches a product bug."
trap: "Blaming the machine running the job because one run on your machine passed."
followUps:
  - question: "What if the test fails only on a busy machine?"
    answer: "I'd compare timings and resource use under similar load. I could find either a wrong assumption in the test or a real slowdown in the app."
---

I keep the first failure and record which commit, or saved code version, ran. I record the setup and input too. I look for the first step that didn't go as expected. Maybe the app returned an empty result or two tests used the same account. A screenshot taken when the test ran out of time doesn't answer either question.

I run the same revision with the same inputs. If other tests ran alongside it in continuous integration (CI), I repeat that setup. I change one thing at a time so I can find what causes the failure. After fixing it, I repeat the failing conditions. I also make sure the test still fails when the app gives a wrong result.

### Example

Suppose I see a notification test fail on one worker, a process that runs tests. I compare request IDs and find another test clears the same inbox. I'd give each test its own recipient and run them at the same time.
