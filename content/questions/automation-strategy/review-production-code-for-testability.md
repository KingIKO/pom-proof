---
title: "The refund provider times out. What would you ask the patch author to prove about the pending refund?"
topic: automation-strategy
roles: [sdet, senior]
level: senior
type: concept
oneLine: "If the provider's reply leaves the outcome unknown, I'd ask for a test that checks the refund stays pending. I'd use the injected payment client to supply that reply."
looksFor:
  - "Say which stored status the test should find after a timeout."
  - "Trigger the timeout through the payment client the refund code already takes."
  - "Check that amounts near the cutoff and duplicate requests still follow the refund rules."
  - "Give support a refund ID to trace without exposing payment details in logs."
trap: "Asking for a test coverage percentage without naming what could go wrong."
followUps:
  - question: "An older test expects a timeout to mark the refund failed. Would you keep that expectation?"
    answer: "I'd first confirm that a timeout means the outcome is unknown. Then I'd change the test to expect pending. I'd keep a separate failure case for an explicit provider rejection."
---

I'd read the code that picks the saved refund status. If the provider times out, we don't know whether the refund went through. I'd ask for a test that reads the stored refund and finds it pending.

An injected payment client is one we pass to the refund code. I'd pass one that times out without calling the provider. I'd leave the review comment where the code chooses the status, so the author knows what to test.

I'd read the tests for duplicate requests and amounts near the refund limits. I'd check whether the patch changes what those cases should do. If support investigates a pending refund, I'd want them to find it by refund ID without seeing payment details in the logs.

### Example

I'd ask the author, “If the provider times out here, can we check that the refund stays pending? We already pass in the payment client, so we can make it time out without calling the provider.”
