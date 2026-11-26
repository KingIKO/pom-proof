---
title: "How would you check backward compatibility before releasing an API change?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Run representative existing clients or their verified contracts against the candidate service, including the less obvious behaviors they rely on."
looksFor:
  - "Identifies supported consumers and versions."
  - "Checks behavior as well as field shape."
  - "Recognizes strict clients can reject additive changes."
  - "Plans for coexistence and verifies rollout assumptions."
trap: "Assuming an added field or enum value is safe because the response still parses as JSON."
followUps:
  - question: "What would you do if a needed change breaks a supported client?"
    answer: "I'd propose a new version or a compatibility path, keep the existing behavior through migration, and check that we can measure adoption."
---

I find out which clients we still support and how each selects an API version. Then I run representative old client flows or their verified contracts against the candidate service. I check semantics too: ordering, defaults, and error handling can change even when the fields look the same. If two versions will coexist, I test that each still gives its client the behavior it expects during the rollout.

### Example

Adding a `pending_review` refund state can break an older app that rejects unknown states. I'd run that app against the candidate. If it cannot handle the new state, I'd exercise the agreed older-version mapping and also test the new client's display before switching traffic.
