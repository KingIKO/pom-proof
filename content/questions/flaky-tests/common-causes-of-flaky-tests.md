---
title: Order search shows the previous query's results. What would you compare across attempts?
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: concept
oneLine: Compare the first failed attempt with a pass and vary one condition at a time.
looksFor:
  - Checks timing, order dependence, and leaked state.
  - Compares environment, resource, and external service behavior.
  - Distinguishes checking too early from the app failing to finish.
  - Chooses a targeted reproduction based on first-failure evidence.
trap: Treating every second-attempt pass as evidence that the test is wrong.
followUps:
  - question: The older search response arrives last only on a busy CI worker. What would you try to reproduce?
    answer: I'd compare the request timing and worker load with a pass, then run just the two relevant searches under similar load. I'd check whether the screen replaces the newer results after both requests finish.
---

I'd preserve the first failure and compare its timestamps, data, and environment with a passing attempt. A timeout might point to a test reading before the result appears, while a missing result after a successful server response can point to the app. I'd check whether the same problem appears when using the product under the same conditions.

Then I'd vary one likely cause: run alone versus after another test, reuse the same seed versus create a fresh one, or compare a known-good dependency against the real service. I'd also check recent browser and image changes and whether the worker was short on resources.

### Example

If order search sometimes shows the previous query's results, I'd compare the order in which the two responses arrive. If the older response overwrites the newer result after both finish, a longer test wait would leave the product race in place.
