---
title: "How would you test access token expiry without making the suite slow?"
topic: api
roles: [automation, sdet, senior]
level: mid
type: scenario
oneLine: "Use test-issued credentials or a controllable clock to cover before and after expiry, then verify the documented refresh path separately."
looksFor:
  - "Uses an isolated test identity and issuer."
  - "Accounts for the service's expiry and clock-skew policy."
  - "Separates expired credentials from missing permissions."
  - "Keeps access and refresh tokens out of test output."
trap: "Sleeping for the token's full lifetime or logging the whole request to debug a failure."
followUps:
  - question: "How do you keep the test from landing on a timing edge?"
    answer: "I control the clock when possible. Otherwise I use fixtures far enough either side of the documented tolerance and cover the exact edge separately."
sources:
  - label: "RFC 6750, bearer token errors"
    url: https://www.rfc-editor.org/rfc/rfc6750.html#section-3.1
---

I'd check that a test-issued token works before expiry and stops working after the time the service accepts it, including any documented clock tolerance. I'd use a controllable clock or credentials issued with the right timestamps in a test environment. To check refresh, I'd confirm the approved refresh operation results in a token accepted by the service. I'd keep raw tokens out of logs and reports.

### Example

For an expense API that supports bearer tokens, I'd read a test expense before expiry, move the test clock past the allowed window, and expect the documented 401 response. A newly issued token should read the same expense without changing the employee's permissions.
