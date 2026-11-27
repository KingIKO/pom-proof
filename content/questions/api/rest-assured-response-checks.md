---
title: "Where do you put setup, the request, and checks in a REST Assured test?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd set up the request in given and send it in when. I'd use then to check the promised status and the values that matter."
looksFor:
  - "Explain where the test prepares the request, sends it, and checks the reply."
  - "Get credentials and the test target from settings."
  - "Check values you can predict from the test data."
  - "Give people enough detail to investigate without printing secrets."
trap: "Checking only the status or letting parallel tests change the same test records."
followUps:
  - question: "When would you save a value from the response?"
    answer: "I'd save an ID if I need it to read the record again or clean up. I'd check the reply before using the ID."
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

I'd start with `given()` to set the request parameters and headers it needs. I'd use `when()` to send the HTTP request. I'd use `then()` to check the expected status and response fields. I give each test its own account and known records. If a check fails, I'd need the record ID and the difference between the expected and actual values without exposing credentials or personal data.

### Example

I'd use a local test record for invoice `draft-18`. I'd expect `200` and JSON with `1800` minor units and `USD`. I'd catch an invoice with the right number in the wrong currency. With REST Assured 7, I'd use `json-path-gpath` to check the fields.
