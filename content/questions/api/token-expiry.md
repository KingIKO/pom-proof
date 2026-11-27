---
title: "How would you test an access token before and after it expires without a long wait?"
topic: api
roles: [automation, sdet, senior]
level: mid
type: scenario
oneLine: "I'd use test credentials or a clock I can move to check both sides of expiry. I'd check the documented way to refresh a token separately."
looksFor:
  - "Use a separate test identity and a test service that issues tokens."
  - "Account for the expiry time and any allowed difference between clocks."
  - "Test expired tokens separately from tokens without the right permissions."
  - "Keep access tokens and refresh tokens out of reports and logs."
trap: "Waiting for a token's full lifetime or printing the whole request to diagnose a failure."
followUps:
  - question: "How would you keep ordinary tests away from the exact expiry time?"
    answer: "I'd set the clock if I can. Otherwise, I'd use tokens far enough before and after the allowed clock difference. I'd test the exact edge separately."
sources:
  - label: "RFC 6750, bearer token errors"
    url: https://www.rfc-editor.org/rfc/rfc6750.html#section-3.1
---

I'd check that a test token works before expiry. I'd also check that it stops working after the time the service accepts it, including any documented allowance for clock differences. I'd move a test clock or use tokens issued with the timestamps I need in a test environment.

I'd test refresh separately by using the approved operation to get a new token. I'd make sure the service accepts it. I'd keep the tokens themselves out of logs and reports.

### Example

With an expense API that accepts bearer tokens, I'd read a test expense before the token expires. I'd move the test clock past the allowed time and expect the documented 401. I'd expect a new token to read the same expense without changing the employee's permissions.
