---
title: "How would you test rate limits without flooding a shared environment?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Use an isolated quota and controlled window to check the threshold, caller scope, advertised retry behavior, and recovery."
looksFor:
  - "Gets the threshold and quota scope from the service contract."
  - "Uses an isolated caller and a small deterministic quota."
  - "Checks the last accepted and first rejected requests."
  - "Checks recovery without depending on arbitrary sleeps."
trap: "Blasting a shared endpoint until something fails and calling the result a rate-limit test."
followUps:
  - question: "How would you cover limits shared across server instances?"
    answer: "I'd use a dedicated test setup with more than one instance and verify they enforce the single quota promised to the caller."
sources:
  - label: "MDN, 429 Too Many Requests"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429
---

I find out what the quota applies to, how the window works, and what the caller sees on rejection. In a dedicated environment I set a small quota if the service supports it, and control time where possible. I assert the last allowed request and the first rejected one. I check that allowed callers outside the quota can continue, and that the limited caller recovers according to the contract.

### Example

Suppose our test environment permits four report downloads per minute per account. I'd accept the fourth request, expect 429 on the fifth, and check another account can still download. Then I'd advance the test clock beyond the documented reset and check the original account can download again.
