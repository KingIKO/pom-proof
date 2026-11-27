---
title: A refund provider times out. What would you ask the patch author to prove about the pending refund?
topic: automation-strategy
roles: [sdet, senior]
level: senior
type: concept
oneLine: Ask for a check that the refund remains pending after an uncertain provider response, using the injected payment client to create that response.
looksFor:
  - Names the stored refund status the test should check after a timeout.
  - Uses the payment client already passed into the refund code to trigger the timeout.
  - Checks whether amount cutoffs or duplicate requests still obey the existing refund rules.
  - Gives support a refund ID to trace without logging payment details.
trap: Asking for a coverage percentage without saying what could go wrong.
followUps:
  - question: An older test expects a timeout to mark the refund failed. Should it still pass?
    answer: I'd confirm that a timeout now means the outcome is unknown, then change that case to expect pending. A definitive provider rejection should still have its own failure case.
---

I'd look at the status this branch writes. A provider timeout leaves the outcome unknown, so I want a test that reads the stored refund and finds it pending. The injected payment client lets us trigger that branch without reaching the provider. I'd put the request right where the patch chooses a status so the author knows what to prove.

I'd also read the existing tests for duplicate requests and amounts near the refund limits to see whether the patch changes their expectations. If support has to investigate a pending refund, I want the logs to identify it by refund ID without carrying payment details.

### Example

My comment could say: “If the provider times out here, can we add a check that the refund stays pending? The payment client is already injected, so we can supply a timeout without calling the provider.”
