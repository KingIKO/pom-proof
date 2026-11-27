---
title: "What does it mean for an HTTP method to be idempotent?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I call a method idempotent when repeating the same request has the same intended effect on the server as sending it once."
looksFor:
  - "Tell the intended effect apart from the response the server sends back."
  - "Compare GET, PUT, and DELETE with ordinary POST."
  - "Explain why a method that only reads meets the same rule."
  - "Check the resource itself as well as the status."
trap: "Failing the test because a repeated DELETE returns a different status."
followUps:
  - question: "Can two identical GET requests return different data?"
    answer: "Yes. I might see different data if another operation changed the resource between reads. The reads themselves ask for no change."
sources:
  - label: "MDN, HTTP request methods"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
  - label: "RFC 9110, idempotent methods"
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2
---

I look at what the client asks the server to do. `GET` asks to read a resource. `PUT` typically sets its state, and `DELETE` asks to remove it. I expect each identical repeat of those requests to have the same intended effect as sending it once. `POST` makes no such general promise.

Two identical create requests may make two records. If a request times out without a response, I use idempotency to decide whether the client can retry automatically. A proxy must never automatically retry a non-idempotent request. If a create must survive a retry, I'd test the API's [idempotency-key contract](/pom-proof/questions/api/idempotency-keys/).

### Example

On a saved-address API, the first `DELETE` may return `204` and the second `404`, depending on the contract. I'd check that the address is still gone and that the customer's other saved addresses still exist. The status difference alone doesn't tell me whether the second request did any extra work.
