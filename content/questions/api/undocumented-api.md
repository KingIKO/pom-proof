---
title: "How would you test an API without usable documentation?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I'd learn how current clients use it in an approved test setup. I'd ask the owner which results clients can count on."
looksFor:
  - "Find the service owner and the callers that use it."
  - "Use approved test environments and normal workflows."
  - "Keep what you saw apart from what the service promises."
  - "Turn agreed behavior into an example others can use."
trap: "Treating the first reply as a promise, including fields the owner never intended clients to use."
followUps:
  - question: "What if the service owner isn't available yet?"
    answer: "I'd write down what I saw and mark it as unconfirmed. I'd keep tests that depend on open questions separate until someone can confirm the expected result."
---

I'd ask the owner which clients use the API and whether they have examples in code or tests. I'd try a normal workflow with known data in an approved test environment. I'd record what I sent and what came back. I'd ask which parts of the reply clients can rely on.

I'd keep observations separate from requirements. The error I see today may be an accident of how the service works. Once we agree on the behavior, I'd write a few examples clients can use.

### Example

The account screen might call a statement URL that sometimes returns an empty list when there are no results. I'd check how the current client handles it. I'd agree with the team on what empty results should look like before testing that the API still works with that client. Until then, I'd record the empty list as something I saw.
