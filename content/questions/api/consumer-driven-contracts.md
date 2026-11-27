---
title: "What can a consumer-driven contract test catch that a schema check misses?"
topic: api
roles: [sdet, senior]
level: senior
type: concept
oneLine: "I'd record requests and results a real client depends on. I'd test whether the service still supports those requests and results."
looksFor:
  - "Start with an interaction the client actually uses."
  - "Explain how the service checks that it still supports the interaction."
  - "Require only the values or fields the client depends on."
  - "Name what can still go wrong when the real services connect."
trap: "Saving every field from the provider's response and calling that a consumer-driven contract."
followUps:
  - question: "If the contract passes, would you still run integration tests?"
    answer: "I'd still test the deployed setup. That includes request routing and credentials. I'd also run the flow that crosses several services."
  - question: "The mobile app and warehouse tool release separately. How would you handle renaming a return status?"
    answer: "I'd check both clients' current contracts against the service before releasing. If either needs the old status, I'd keep it until that client can switch. If both ship with the service as one unit, I'd start with a direct test of them together."
sources:
  - label: "Pact, consumer-driven contracts"
    url: https://docs.pact.io/
  - label: Pact, when contract tests are a fit
    url: https://docs.pact.io/getting_started/what_is_pact_good_for
---

I'd start with a request the consumer, or client, actually makes. I'd run the client code against a test double that stands in for the service. I'd record the request and response details the client depends on. That record is the consumer-driven contract.

I'd have the provider, the service answering the request, test the same interaction with the required data in place. I'd leave unrelated fields flexible so adding one doesn't break a client that ignores it. I'd still run other tests for business rules and connections between deployed services.

### Example

I'd test a web client that opens a different screen when a return is ineligible. Its contract would name the request and the error code that opens that screen. A generic error schema, which describes the shape of the response, could accept a new code. I'd want my contract test to catch that change before the browser stops offering the fallback.
