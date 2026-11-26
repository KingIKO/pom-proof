---
title: "When would you mock an API dependency, and when would you keep it real?"
topic: api
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: "Control dependencies to make hard failure paths repeatable, and keep targeted real checks for assumptions that only the integration can prove."
looksFor:
  - "Connects the choice to the behavior under test."
  - "Uses doubles for hard-to-trigger failures."
  - "Exercises real configuration and integration in a controlled environment."
  - "Names how stale fixtures will be detected."
trap: "Mocking a provider with the team's own guessed response and using the green result as release evidence for the integration."
followUps:
  - question: "What if the vendor sandbox is flaky?"
    answer: "I keep fast deterministic tests separate, collect evidence on sandbox failures, and tell the release owner when real integration evidence is missing."
---

I'll mock a dependency when I need to choose exactly when it fails or returns a particular result. That makes the application's reaction repeatable. I also keep a focused test against the real integration in an approved test environment, since a mock can't tell me whether the credentials, routing, or data format work with that service. I review the fixtures when the provider changes its contract.

### Example

For address validation I'd use a stub to return an ambiguous match on demand and check that the customer can select the intended address. Before releasing the integration, I'd also submit a known test address to the provider sandbox and check that our application can read and show the provider's result.
