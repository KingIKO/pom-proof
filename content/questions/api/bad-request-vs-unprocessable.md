---
title: "How would you explain the difference between HTTP 400 and 422?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd read 400 as a broad error with the request. A 422 says the server understands the format but can't carry out the instructions."
looksFor:
  - "Explain that 400 can cover more than broken JSON."
  - "Give one example with garbled input and one that breaks a business rule."
  - "Use the API's documented promise to decide which response to expect."
  - "Check the error details and make sure the request saved nothing by mistake."
trap: "Reporting a bug whenever an API rejects a request with 400 instead of 422, even when that matches its rules."
followUps:
  - question: "What else would you check when a request fails validation?"
    answer: "I'd look for an error code or a pointer to the field the client needs to fix. I'd check that the rejected request didn't create a record."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#client_error_responses
---

I'd look at how much of the request the server understood. If a JSON document is broken, 400 is a reasonable response. A 422 fits when the server understands the content type and can read the format, but can't carry out the instructions.

Some APIs use 400 for both cases. I follow the rules the API promises its clients. I also check that the error helps them fix the request.

### Example

I'd send a booking request with a missing closing brace. I'd then send a valid JSON request whose end date is before its start date. If the API distinguishes 400 from 422, I'd expect different responses. I'd check that neither request creates a booking.
