---
title: "How would you test an API's rate limit without swamping a shared environment?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I'd use a separate quota and control the time window. I'd check where the limit starts, who it affects, and when the caller can try again."
looksFor:
  - "Get the number of requests allowed and who shares them from the API rules."
  - "Give the test caller a small, predictable limit in a separate setup."
  - "Check the last request that should pass and the first that should fail."
  - "Check when requests work again without guessing how long to wait."
trap: "Making requests until something fails in a shared environment and calling that a rate-limit test."
followUps:
  - question: "How would you check a limit that several servers share?"
    answer: "I'd use a dedicated setup with more than one server instance. I'd check that they enforce the one quota the API promises the caller."
sources:
  - label: "MDN, 429 Too Many Requests"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429
---

I start by checking who shares the quota, the number of requests allowed in a given period. I'd find out when that period resets and what the API says when it rejects a request. In a dedicated environment, I'd use a small quota if the service supports it. I'd control the clock where possible.

I'd check the last allowed request and the first rejected one. I'd make sure callers outside that quota can still work. I'd check any retry guidance and when the limited caller can make requests again.

### Example

If each test account can download four reports per minute, I'd expect the fourth request to pass and the fifth to return 429. I'd check that another account can still download. I'd move the test clock past the documented reset and check that the first account can download again.
