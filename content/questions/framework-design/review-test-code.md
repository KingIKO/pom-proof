---
title: "Two orders appear and the cancellation test passes. What would you check before approving it?"
topic: framework-design
roles: [automation, sdet, senior]
level: senior
type: concept
oneLine: "I want the test to show it canceled the order it created. I follow that order ID through the whole test."
looksFor:
  - "Use Cancel on the test's own order and wait for that order's confirmation."
  - "Show that canceling a different order makes the test fail with a useful message."
  - "Let the test control its order from creation to cleanup."
  - "Test detailed cancellation rules at the service if the browser adds no evidence."
trap: "Improving helper names while leaving a check that passes even when cancellation fails."
followUps:
  - question: "The test clicks the first Cancel button and checks a generic toast. What would you ask the author to change first?"
    answer: "I'd ask them to find the Cancel button for the order ID they created. I'd ask them to check that same ID in confirmation. I'd offer to make the change together and leave helper names for another review."
---

I'd follow the order ID from setup to cleanup. Suppose the test creates A104 but clicks the first Cancel button it finds. It could cancel another order and still pass. I'd ask the author to find the button for A104 and wait for that order's confirmation. If the browser adds no evidence for detailed rules, I'd check those rules by calling the service directly.

I'd also check what the toast proves. A toast is a brief message on the screen. I'd ask the author to run the test with a different order selected. I'd expect the test to fail and show the ID it expected and the one it saw.

If I were reviewing the app code, I'd ask whether it changes the right record. When I review the test, I want proof that it catches a wrong record.

### Example

I'd require the test to create its own order and check the exact ID in the cancellation message. If the product promises to save the cancellation, I'd reload and check it remains canceled. I'd cover broader business rules in service tests.
