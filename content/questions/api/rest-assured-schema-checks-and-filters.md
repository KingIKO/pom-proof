---
title: "How would you check a receipt's shape and trace a REST Assured failure without exposing secrets?"
topic: api
roles: [automation, sdet]
level: senior
type: tooling
oneLine: "I'd check the receipt against its schema. I'd use a filter to add a request ID and keep credentials and bodies out of logs."
looksFor:
  - "Use a schema that names the required fields and value types."
  - "Keep checks for one endpoint separate from filters that run across requests."
  - "Add an ID that links the failure to the request and log only what you need."
  - "Hide credential headers and keep private bodies out of logs."
trap: "Logging full requests and replies just to get the ID for a trace."
followUps:
  - question: "Why would you also check the actual receipt amount?"
    answer: "I'd use a known transaction to check the exact amount. A schema can require a whole number in minor units, but the number can still be wrong."
sources:
  - label: REST Assured schema validation module
    url: https://rest-assured.io/docs/usage/json-schema/
  - label: REST Assured inline schema matcher source
    url: https://raw.githubusercontent.com/rest-assured/rest-assured/rest-assured-7.0.0/modules/json-schema-validator/src/main/java/io/restassured/module/jsv/JsonSchemaValidator.java
  - label: REST Assured filters and request IDs
    url: https://rest-assured.io/docs/usage/filters/
  - label: REST Assured failure-only logs and header redaction
    url: https://rest-assured.io/docs/usage/logging/
  - label: JSON Schema draft 4 validation
    url: https://json-schema.org/draft-04/draft-fge-json-schema-validation-00
  - label: Java 21 UUID generator
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/UUID.html
examples:
  - title: Trace and validate the test receipt
    variants:
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
          import io.restassured.filter.Filter;
          import java.util.UUID;
          import org.junit.jupiter.api.Test;

          class ReceiptSchemaTest {
            private static final String SCHEMA = """
                {
                  "$schema": "http://json-schema.org/draft-04/schema#",
                  "type": "object",
                  "required": ["id", "totalMinor"],
                  "properties": {
                    "id": {"type": "string"},
                    "totalMinor": {"type": "integer"}
                  }
                }
                """;

            @Test
            void checksReceiptContract() {
              String requestId = UUID.randomUUID().toString();
              Filter correlate = (req, res, ctx) -> {
                req.header("X-Request-Id", requestId);
                return ctx.next(req, res);
              };
              var receipt = given().filter(correlate)
                  .get("http://localhost:3000/receipts/demo-41");
              try {
                receipt.then().statusCode(200).body(matchesJsonSchema(SCHEMA));
              } catch (AssertionError failure) {
                throw new AssertionError("Receipt check failed, request ID " + requestId);
              }
            }
          }
---

I'd use a JSON schema, a set of rules for the fields and value types, to check the receipt's shape. I'd use known test data to check the exact amount and other business expectations. A filter is code that runs around requests. I'd use one to add a token or request ID without repeating that setup.

If the test fails, I'd log the request ID and the minimum status details. If I enable standard failure logging, I'd exclude credential headers and private request or response bodies. I'd also check what failed checks show in CI reports. A schema failure can expose more detail than I want to share.

### Example

With the `json-schema-validator` module installed, I'd read a fictional receipt from a local service that records `X-Request-Id`. I'd expect `200`, a text ID, and a whole number in `totalMinor`. If the check fails, I'd report only the request ID so someone with test log access can look up the trace.
