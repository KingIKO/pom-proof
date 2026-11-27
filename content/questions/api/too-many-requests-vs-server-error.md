---
title: "What do HTTP 429, 500, and 503 mean for the caller?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I read 429 as a request limit and 500 as an unexpected server error. A 503 means the service can't handle the request right now."
looksFor:
  - "Tell a limit on the caller's requests apart from a service that can't take requests right now."
  - "Check whether a request already had an effect before treating 500 as a failure to save."
  - "Look for Retry-After when the server sends it."
  - "Check that the client's next step fits the request and the API's rules."
trap: "Immediately retrying every 429, 500, and 503, even for requests that change data."
followUps:
  - question: "Does every 429 need a Retry-After header?"
    answer: "I'd treat the header as optional. If the response includes it, I'd use it. Otherwise I'd follow the service's documented retry policy."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
  - label: "MDN, Retry-After"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
---

I read 429 as a rate limit, meaning the caller has sent more requests than the service allows in a period. A 500 means the server hit an unexpected error. A 503 means the service can't handle the request for now. I check what the client should do in each case.

The server can send a `Retry-After` header to tell the client when to try again. When it's present and a retry is supported, I'd check that the client waits as directed. If a write fails, I'd see whether it already saved anything before assuming I can repeat it.

### Example

If a staff search reaches its quota, I'd expect the screen to wait instead of sending more searches. If invoice creation returns 500, I'd look for an existing invoice in the test account before trying again.
