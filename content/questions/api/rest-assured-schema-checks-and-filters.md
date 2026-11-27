---
title: "How would you check a receipt schema and trace failures in REST Assured without logging secrets?"
topic: api
roles: [automation, sdet]
level: senior
type: tooling
oneLine: "Check receipt shape with the schema matcher and use a filter to attach a request ID without writing credentials or payloads to logs."
looksFor:
  - "Uses a schema that names required fields and their types."
  - "Keeps endpoint-specific assertions separate from cross-request filters."
  - "Adds a correlation ID and emits limited diagnostics on failure."
  - "Redacts headers and avoids logging private bodies."
trap: "Logging full requests and responses to get a trace ID more quickly."
followUps:
  - question: "Why still check the actual receipt amount?"
    answer: "The schema can require an integer in minor units and the number can still be wrong. I'd use a known transaction to assert the amount independently."
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

I'd use the JSON schema matcher to check required fields and types. I'd keep exact amounts and other business expectations in tests with known data. A filter can add a token or request ID across calls without duplicating that setup.

For diagnosis I'd log a request ID and minimal status information on failure. If I enable standard failure logging, I'd blacklist credential headers and avoid bodies with private data. I also check what assertion failures put in CI reports. A schema failure can include more detail than I want to publish.

### Example

With the `json-schema-validator` module installed, read a synthetic receipt from a local service that records `X-Request-Id`. Expect `200` and a body with a string ID and integer `totalMinor`. The example reports only the request ID on assertion failure, so someone with test log access can look up the trace.
