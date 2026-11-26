---
title: "How do HTTP 429, 500, and 503 differ for an API client?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "429 signals rate limiting, 500 signals an unexpected server failure, and 503 signals that the service is temporarily unable to handle the request."
looksFor:
  - "Distinguishes rate limiting from general service unavailability."
  - "Does not treat 500 as proof the operation never took effect."
  - "Looks for Retry-After where supplied."
  - "Checks that recovery fits the request and the service contract."
trap: "Retrying every 429, 500, and 503 immediately, including state-changing requests."
followUps:
  - question: "Is Retry-After required on every 429?"
    answer: "No. The header may be supplied. I use it when present and otherwise follow the service's documented retry policy."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
  - label: "MDN, Retry-After"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
---

A 429 says the caller is being rate limited. A 500 tells me the server hit an unexpected error, and a 503 tells me it's temporarily unable to handle the request. I check how the client is meant to behave for each one. If there's a `Retry-After` header, I check that a supported retry waits as instructed. If a write fails, I also check whether it already took effect before assuming it can be repeated.

### Example

If a staff search reaches its quota, I'd expect the UI to wait rather than keep sending searches. If an invoice creation returns 500, I'd inspect the test account for an existing invoice before making another request.
