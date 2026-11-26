---
title: "How would you prove an idempotency key prevents duplicate payments?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Retry the same logical payment after an uncertain result, then verify that it produced one payment across the systems that record it."
looksFor:
  - "Uses the same key and equivalent input for the same intent."
  - "Covers response loss after the service accepts the write."
  - "Checks concurrency, key scope, and incompatible reuse against the contract."
  - "Verifies effects in both the application and the provider where possible."
trap: "Checking that the response bodies match and never looking for a second charge."
followUps:
  - question: "What happens if the key has expired?"
    answer: "I'd test the documented retention rule and check how the client resolves the outcome before starting another payment."
sources:
  - label: "Stripe, idempotent requests as one concrete example"
    url: https://docs.stripe.com/api/idempotent_requests
---

I'd check the contract for key scope, retention, and what it does with conflicting input. Then I'd test the failure we actually care about: the provider accepted the payment, but the caller never received the result. The retry uses the same key and equivalent input. I'd verify one payment and one corresponding ledger entry. I also test concurrent submissions and reuse of the key with a different amount, using the policy for that API.

### Example

In a sandbox I'd make the test client drop the first reply after recording payment acceptance. After it repeats the request, I'd compare the logical payment ID and check both the provider's sandbox and the order ledger for a single charge. Matching responses alone would leave the duplicate risk open.
