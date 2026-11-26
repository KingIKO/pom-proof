---
title: "What do you assert after an API returns the expected status?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "Check the response contract, the values that matter to the caller, and the state or side effect the request promised."
looksFor:
  - "Chooses meaningful response fields and headers."
  - "Uses expected values derived from test inputs."
  - "Reads back persisted state or waits on a documented outcome."
  - "Avoids brittle whole-response snapshots."
trap: "Asserting that a field exists without checking whether its value is correct."
followUps:
  - question: "What if the operation completes asynchronously?"
    answer: "I'd assert the immediate acknowledgement, then wait for the promised outcome through the status endpoint or event with a deadline from the test contract."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
---

First I check the fields the consumer needs, with values I can predict from the data I sent. I check a response header if the client depends on it, such as content type. For a write, I'd read the resource back or inspect the resulting event. A response echo can look convincing even when the record was saved with different values. I avoid asserting incidental fields that change on every run.

### Example

When an invoice API returns 201, I'd check its identifier, amount in minor units, and currency. Then I'd read it from the test customer's invoice list and compare the saved amount. That catches an API that echoes `1299` and stores `12` after a rounding mistake.
