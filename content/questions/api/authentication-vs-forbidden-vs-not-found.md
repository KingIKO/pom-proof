---
title: "How do HTTP 401, 403, and 404 differ?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "401 indicates missing or invalid authentication, 403 means the server refuses access, and 404 can mean missing or deliberately undisclosed."
looksFor:
  - "Separates identity from access rights."
  - "Explains why 404 can be an intentional access policy."
  - "Uses known resources and test identities."
  - "Checks that denial exposes no protected content."
trap: "Assuming a 404 proves the requested record never existed."
followUps:
  - question: "What if your own account also gets a 404 for the fixture?"
    answer: "I'd verify the setup and resource identifier with the owner before treating the other account's 404 as evidence of isolation."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#client_error_responses
---

For a protected endpoint I try a request with no credentials, then one with valid credentials that lack the required permission. I generally expect 401 and 403 respectively, subject to the endpoint's policy. Some services deliberately return 404 to a caller who shouldn't know whether a resource exists. I establish that the fixture is present with an account that is supposed to see it before I test denial.

### Example

In a document app I'd create a test invoice as its owner and read it successfully. Then I'd use a separate test account under the documented privacy policy and verify that its response contains neither the invoice nor its identifying metadata.
