---
title: "Order search shows results from the last query. What would you compare between runs?"
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I compare the first failure with a pass. I change one condition at a time."
looksFor:
  - "Check when each action happened, what ran before it, and what data other tests left behind."
  - "Compare the test environment, available resources, and how outside services behave."
  - "Tell a check that ran too early apart from an app that didn't finish."
  - "Use what you saw in the first failure to choose which conditions to repeat."
trap: "Assuming the test is wrong because it passes the second time."
followUps:
  - question: "The older response arrives last only on a busy CI worker. What would you try to repeat?"
    answer: "I'd compare request times and machine load with a passing run. I'd run only those two searches under similar load. I'd check whether the screen replaces the newer results after both requests finish."
---

I'd save the first failure and compare its timestamps, data, and environment with a pass. A timestamp records when an event happened. The environment is where the test runs and how it is set up. If the test runs out of time, it may be reading before results appear. If the server reports success but results never appear, the app may be at fault.

I'd try the same steps myself under the same conditions.

I'd change one thing at a time. I could run the test alone and after another test. I could reuse the starting data and then try fresh data. I could replace the real service with one I know works for this test. I'd also check browser and image changes and see whether the worker, the machine running the test, was low on resources.

### Example

If order search sometimes shows results from the previous query, I'd compare when the two responses arrive. If the older response replaces the newer result after both finish, I'd report a race in the product. That's a bug that depends on which action finishes first, so making the test wait longer would leave it in place.
