---
title: "What kind of conflict should make an API return HTTP 409?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: "I'd expect 409 when an otherwise valid request can't go through because of the record's current state."
looksFor:
  - "Name the current state that blocks the request."
  - "Send a request that would otherwise be valid."
  - "Check what the response promises to tell the client about what to do next."
  - "Check that the failed request leaves the existing record unchanged."
trap: "Calling every rejected input a conflict without showing which existing state conflicts with it."
followUps:
  - question: "Should the client send the same request again automatically?"
    answer: "I wouldn't assume a retry works. If someone has reserved the slot, the client may need to fetch the available times again and choose a different one."
sources:
  - label: "MDN, 409 Conflict"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409
---

I'd put the record in the state that blocks the request, then show that the request conflicts with it. If the record were available and the request were otherwise valid, I'd expect it to work. I check what the API promises to return and what the client can do next. I also check that the rejected request leaves the existing record unchanged.

### Example

If a booking API promises 409 for a reserved slot, I'd book the slot as one test customer. I'd send a valid request for the same slot as another customer and check the documented conflict code. I'd read the first customer's booking back as its owner. I'd check that the second customer got no confirmation.
