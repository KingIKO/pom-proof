---
title: "How would you test requests an API should reject when they try to write data?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I'd change one part of a valid request or its setup at a time. I'd check the rejection and make sure it didn't save anything unexpectedly."
looksFor:
  - "Run a valid request with the same starting setup."
  - "Test missing data, invalid values, and blocked states separately."
  - "Check the error fields that callers use."
  - "Look for incomplete writes or events the API might have sent before rejecting the request."
trap: "Sending five invalid fields together and counting one error as proof the API checked all five."
followUps:
  - question: "When would you put more than one wrong field in a request?"
    answer: "I'd combine wrong fields if the client needs several errors at once. I'd also do it if the API promises which error comes first."
  - question: "What kinds of rejected requests would you test before shipping a new write operation?"
    answer: "I'd test badly formatted bodies and values of the wrong type. I'd check nulls, empty values, values just outside limits, and bodies that are too large. I'd also check disallowed repeats and missing or invalid credentials. For each, I'd expect the promised status and error, such as 413 when the body is too large."
sources:
  - label: RFC 9110, HTTP client errors
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5
---

I'd start with valid data that I know can succeed. In each test, I'd change one field or one piece of the setup. That helps me tell whether the API rejected missing data, a bad value, or the record's current state. I'd check the error details the client uses and read back the state to check that it stayed as expected. If a successful request sends a notification, I'd check that the rejected request didn't put one in the queue.

### Example

I'd test editing a delivery address by leaving out the postcode. In another case, I'd submit a valid address after dispatch. I'd expect the API to reject each for a different reason. I'd check that the original address stays on the order after both requests.
