---
title: "How would you structure a Java API check with REST Assured?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "Put the test setup in given, make the request in when, and assert the contract and business values in then."
looksFor:
  - "Explains the setup, request, and assertion chain."
  - "Keeps credentials and target environment configurable."
  - "Checks data derived from the setup."
  - "Keeps diagnostics useful without printing secrets."
trap: "Asserting only the status or sharing mutable fixture state across parallel tests."
followUps:
  - question: "When would you extract a response value?"
    answer: "When I need a returned ID for a follow-up read or cleanup. I'd validate the response before using the ID."
sources:
  - label: "REST Assured, usage examples"
    url: https://rest-assured.io/docs/usage/examples/
  - label: "REST Assured, verifying responses"
    url: https://rest-assured.io/docs/usage/verifying-responses/
---

I'd use `given()` to set up the request and any parameters or headers, `when()` for the HTTP call, and `then()` for the expected status and response fields. I keep the account and known data local to each test. If something fails, I'd want the record ID and assertion diff on hand without printing credentials or personal data.

### Example

If a draft invoice fixture has amount `1800` in minor units, I'd read it through `when().get("/invoices/{id}", id)` and check `then().statusCode(200).body("totalMinor", equalTo(1800))`. I'd assert the fixture currency too, so the test can catch an invoice with the right number in the wrong currency.
