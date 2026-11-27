---
title: "What do HTTP 401, 403, and 404 tell a caller?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd read 401 as missing or invalid proof of identity and 403 as refusal. A 404 can mean the record is missing or deliberately hidden."
looksFor:
  - "Tell proving who you are apart from being allowed to see the record."
  - "Explain why an API might return 404 on purpose when it denies access."
  - "Use a known record and separate test accounts."
  - "Check that a denial reveals none of the protected record."
trap: "Assuming a 404 proves the requested record never existed."
followUps:
  - question: "What if the account that should see the test record also gets a 404?"
    answer: "I'd check the setup and record ID with the owner. Until I know the record exists, I wouldn't treat the other account's 404 as proof that the API keeps records separate."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#client_error_responses
---

I'd start with a protected endpoint, a URL that requires permission. I'd send one request without credentials, the details that prove who I am. I'd send another with valid credentials but no permission. I generally expect 401 for the first and 403 for the second, depending on the endpoint's policy.

Some services send 404 on purpose so the caller can't tell whether the record exists. I'd first check that an account with permission can see the record. Then I'd test the account that should be denied.

### Example

In a document app, I'd create an invoice as its owner and read it back. I'd try to read it with a separate test account under the documented privacy policy. I'd check that the reply gives away neither the invoice nor details that identify it.
