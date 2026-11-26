---
title: "What does it mean for an HTTP method to be idempotent?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "An identical request made several times has the same intended effect on the server as making it once."
looksFor:
  - "Distinguishes intended effect from response equality."
  - "Contrasts GET, PUT, and DELETE with ordinary POST."
  - "Explains why a read-only method is also idempotent."
  - "Checks the resulting resource instead of relying on the status alone."
trap: "Failing a repeat DELETE just because it returns a different status the second time."
followUps:
  - question: "Can two identical GET requests return different data?"
    answer: "Yes. Another operation may have changed the resource between reads, even though the reads themselves requested no change."
sources:
  - label: "MDN, HTTP request methods"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
  - label: "RFC 9110, idempotent methods"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2
---

I look at what the client is asking the server to do. GET asks for a read. PUT typically sets the state of a resource, and DELETE asks to remove it. Repeating an identical request with any of those methods is meant to have the same effect as sending it once. POST has no general promise like that; two identical create requests may make two records.

### Example

On a saved-address API, the first DELETE may return `204` and the second `404`, depending on the contract. In my test I'd confirm the address remains absent and the customer's other saved addresses still exist. The status difference doesn't tell me that the second request did extra work.
