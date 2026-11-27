---
title: "How would you test that an idempotency key prevents a duplicate payment?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I'd retry the same payment after losing its result. I'd check that each system still records just one payment."
looksFor:
  - "Reuse the key and equivalent inputs for the same intended payment."
  - "Test what happens if the first reply is lost after the payment is accepted."
  - "Check simultaneous requests, where the key applies, and reuse with different inputs against the API contract."
  - "Check both the app and the payment provider if both are available."
trap: "Comparing the response bodies and never looking for a second charge."
followUps:
  - question: "What would you check after the key expires?"
    answer: "I'd test how long the API promises to remember the key. I'd check how the client finds the first payment's result before starting another one."
sources:
  - label: "Stripe, idempotent requests as one concrete example"
    url: https://docs.stripe.com/api/idempotent_requests
---

An idempotency key marks requests for the same intended payment. I'd read the API contract, the rules it promises to callers. I'd check where the key applies, how long it stays valid, and what happens if I reuse it with different inputs.

I'd test a payment the provider accepts but whose reply never reaches the caller. I'd retry with the same key and equivalent inputs. I'd then check for one payment and one matching ledger entry, the record of the charge. I'd also send requests at the same time and test reuse with a different amount under the API's policy.

### Example

In a sandbox, a test version of the payment service, I'd have the test client drop the first reply after recording acceptance. After retrying, I'd compare the payment IDs. I'd look in the provider's sandbox and the order ledger for a single charge. Matching replies alone wouldn't tell me whether the provider charged twice.
