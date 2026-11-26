---
title: "How would you explain the difference between HTTP 400 and 422?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "400 is a broad client error; 422 describes understood, syntactically valid content whose instructions the server cannot process."
looksFor:
  - "Explains that 400 is broader than malformed JSON."
  - "Gives separate syntax and business-rule examples."
  - "Uses the endpoint contract to set exact expectations."
  - "Checks error detail and absence of an unintended write."
trap: "Filing a bug any time a documented API uses 400 for a validation failure instead of 422."
followUps:
  - question: "What else belongs in a validation test?"
    answer: "A useful error code or field pointer for the client and evidence that the invalid request did not create the resource."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#client_error_responses
---

I'd look at what the server was able to understand. A broken JSON document is a good example of a 400. A 422 fits when the server understands the content type and the request is syntactically valid, but its instructions can't be processed. Some APIs use 400 for both. I test what we agreed to expose to clients and make sure the error points them toward a correction.

### Example

For a booking endpoint I'd send a request missing a closing brace, then a separate well-formed request with an end date before the start date. Under a contract that distinguishes 400 and 422, I'd expect different responses and no booking from either.
