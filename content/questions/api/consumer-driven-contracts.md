---
title: "What would a consumer-driven contract test tell you that a schema check would miss?"
topic: api
roles: [sdet, senior]
level: senior
type: concept
oneLine: "A consumer-driven contract captures requests and outcomes a real client depends on, then checks whether the provider still supports them."
looksFor:
  - "Starts with an actual consumer interaction."
  - "Explains how the provider verifies it."
  - "Matches only what the consumer relies on."
  - "Identifies failure modes that still need integration tests."
trap: "Writing a provider-owned snapshot of every response field and calling it a consumer-driven contract."
followUps:
  - question: "Can a passing contract replace integration tests?"
    answer: "No. I'd still exercise deployed concerns such as routing, credentials, and the flow that crosses multiple services."
sources:
  - label: "Pact, consumer-driven contracts"
    url: https://docs.pact.io/
---

I'd start with a behavior the client actually uses. The consumer test exercises its code against a test double and captures the interaction that code depends on. The provider then runs verification with the relevant data state to show it can satisfy that interaction. I'd keep unrelated fields flexible so an addition doesn't break a client that ignores it. I still need other tests for business rules and deployed connections.

### Example

A web client may fall back to a different screen when a return is ineligible. Its contract would describe the request and the particular error code that triggers that screen. A generic error schema could accept a renamed code even though the browser would stop offering the fallback.
