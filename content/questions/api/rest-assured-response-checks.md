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
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Check a seeded invoice's amount and currency
    variants:
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import io.restassured.http.ContentType;
          import org.junit.jupiter.api.Test;

          class DraftInvoiceTest {
            @Test
            void readsTheExpectedDraft() {
              var base = System.getenv().getOrDefault("INVOICE_API", "http://localhost:3000");
              given().baseUri(base).accept(ContentType.JSON)
                  .pathParam("id", "draft-18")
                  .when().get("/invoices/{id}")
                  .then().statusCode(200).contentType(ContentType.JSON)
                  .body("totalMinor", equalTo(1800), "currency", equalTo("USD"));
            }
          }
---

I'd use `given()` to set up the request and any parameters or headers, `when()` for the HTTP call, and `then()` for the expected status and response fields. I keep the account and known data local to each test. If something fails, I'd want the record ID and assertion diff on hand without printing credentials or personal data.

### Example

For a local fixture with invoice `draft-18`, I'd expect `200` JSON with `1800` in minor units and `USD`. That catches an invoice with the right number in the wrong currency. With REST Assured 7, use `json-path-gpath` for the field assertions.
