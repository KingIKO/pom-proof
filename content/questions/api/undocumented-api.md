---
title: "How would you test an API that has no usable documentation?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "Use an approved test setup and current consumers to learn the behavior, then confirm which observations clients can depend on."
looksFor:
  - "Finds service owners and known callers."
  - "Uses safe environments and ordinary approved workflows."
  - "Separates observed behavior from a promised contract."
  - "Turns agreed behavior into a reusable example."
trap: "Freezing the first response as the contract, including fields the service owner never intended clients to use."
followUps:
  - question: "What if the service owner is temporarily unavailable?"
    answer: "I'd document observations as provisional and keep checks that depend on unanswered behavior separate until someone can confirm it."
---

I'd ask the owner which clients use the API and whether they have examples in code or tests. In an approved test environment I'd exercise a normal workflow with known data, record the request and response, and ask which parts are stable. I keep observations separate from requirements, especially when an error could just be today's implementation. Once we agree on behavior, I write a small set of examples consumers can refer to.

### Example

The account screen might read a statement endpoint whose empty results sometimes appear as an empty list. I'd check the existing client and ask the team to settle the empty response before locking it into a compatibility test. Until then I'd label it as observed behavior.
