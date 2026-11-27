---
title: Two orders are on screen and the cancellation test goes green. What would you require before approving it?
topic: framework-design
roles: [automation, sdet, senior]
level: senior
type: concept
oneLine: Make the test prove that it cancelled the order it created, using an ID the reviewer can follow through the run.
looksFor:
  - Scopes the Cancel action to the seeded order and waits for that order's confirmation.
  - Checks that cancelling a different order would turn the case red with a useful message.
  - Gives the spec control of its own order from creation through cleanup.
  - Keeps separate cancellation rules in a service test when the browser adds no evidence.
trap: Improving helper names while leaving an assertion that passes even when cancellation fails.
followUps:
  - question: The new test clicks the first Cancel button and checks a generic toast. What's the first review comment you'd leave?
    answer: I'd ask the author to scope Cancel to the ID the test created and include that ID in the confirmation check. I'd offer to pair on that change and leave helper naming for a separate pass.
---

I'd follow the order ID from setup to cleanup. If the test seeds A104 but uses the first Cancel button it finds, another order could be cancelled without turning the test red. I'd ask for a control scoped to A104 and a wait for the confirmation tied to that ID. I'd keep the detailed cancellation rules at the service layer if the extra browser steps don't help prove them.

I'd ask the author to try the same test with a different order selected. The test should fail and tell me which order it expected and which one the screen reported. In the application review I'd focus on whether the cancellation code changes the right record. In this review I want proof that the test notices if it doesn't.

### Example

I'd ask for an order created by this test, an exact order identifier in the cancellation confirmation, and a reload check if we promise persistence. I'd leave broad business-rule coverage to service tests.
