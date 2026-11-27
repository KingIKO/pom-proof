---
title: "How would you check backward compatibility before releasing an API change?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I'd test the proposed service with existing clients or their verified contracts. I'd include behavior the clients rely on beyond which fields come back."
looksFor:
  - "Identify which clients and versions the service still supports."
  - "Check what operations do as well as what fields they return."
  - "Check whether a strict client rejects fields or values it doesn't know."
  - "Plan for versions to run side by side and test what the rollout assumes."
trap: "Assuming a new field or enum value is safe just because the response is still valid JSON."
followUps:
  - question: "What if a change you need would break a supported client?"
    answer: "I'd propose a new version or a way to keep the old client working. I'd keep its existing behavior through the move. I'd check that we can measure who has switched."
---

I'd check backward compatibility, which means supported older clients can still use the changed API. I'd find out which clients we still support and how each asks for an API version. I'd run typical workflows in those clients or check their verified contracts, the requests and results they rely on. I'd run those checks on the service version we're proposing for release.

Even if the fields look the same, I'd check how the API orders results, picks defaults, and handles errors. If two versions will run together, I'd test the assumption that each still gives its clients the promised behavior during the rollout.

### Example

An enum value is one option in a fixed set, such as the possible refund states. Adding `pending_review` can break an older app that rejects unfamiliar states. I'd run that app against the proposed service. If it can't read the new state, I'd check the value we agreed to return for the old API version. I'd also check how the new app shows the state before switching traffic.
