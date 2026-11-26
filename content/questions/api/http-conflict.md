---
title: "When would you expect an API to return HTTP 409?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: "409 fits a request that cannot proceed because it conflicts with the resource's current state."
looksFor:
  - "Names the conflicting state."
  - "Sends an otherwise valid request."
  - "Checks the contract for how the client can recover."
  - "Verifies the winning state is preserved."
trap: "Calling every rejected input a conflict without establishing what it conflicts with."
followUps:
  - question: "Should the client automatically resend the same request?"
    answer: "I wouldn't assume so. If the slot has already been reserved, the client may need to reload availability and choose a different slot."
sources:
  - label: "MDN, 409 Conflict"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409
---

I'd set up the server state before making the request, so I can show why it conflicts. The same request should work against an available resource if everything else is valid. I check the contract for the response and what the client can do next. I also confirm that the failed request leaves the existing resource untouched.

### Example

Suppose a booking API promises a 409 for an already reserved slot. I'd reserve that slot with one test customer, then make an otherwise valid reservation as a second. I'd verify the documented conflict code, read back the first reservation as its owner, and check that the second customer didn't receive a booking confirmation.
