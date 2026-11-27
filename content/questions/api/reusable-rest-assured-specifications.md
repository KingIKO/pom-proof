---
title: "Several account tests repeat the same REST Assured setup. What would you extract?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "Share request configuration and stable response expectations through specifications, then put resource paths behind a small client."
looksFor:
  - "Gives the account client one place to get its request settings and one place to apply the successful-read defaults."
  - "Includes only genuinely shared configuration and expectations."
  - "Keeps per-test credentials and fixture IDs under the test's control."
  - "Leaves the business expectation visible at the call site."
trap: "Using a shared success specification for tests whose contracts expect errors."
followUps:
  - question: "How would you test the unauthorized response?"
    answer: "I'd use a request spec without the token and a separate expected response or local assertions for the rejection contract."
sources:
  - label: REST Assured request and response specification reuse
    url: https://rest-assured.io/docs/usage/specification-reuse/
  - label: REST Assured RequestSpecBuilder source
    url: https://raw.githubusercontent.com/rest-assured/rest-assured/rest-assured-7.0.0/rest-assured/src/main/java/io/restassured/builder/RequestSpecBuilder.java
  - label: REST Assured response assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Apply account specs and leave the plan assertion in the test
    variants:
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static java.util.Objects.requireNonNull;
          import static org.hamcrest.Matchers.equalTo;
          import io.restassured.builder.RequestSpecBuilder;
          import io.restassured.builder.ResponseSpecBuilder;
          import io.restassured.http.ContentType;
          import io.restassured.specification.RequestSpecification;
          import io.restassured.specification.ResponseSpecification;
          import io.restassured.response.ValidatableResponse;
          import org.junit.jupiter.api.Test;

          class AccountPlanTest {
            private static final ResponseSpecification ACCOUNT_READ = new ResponseSpecBuilder()
                .expectStatusCode(200).expectContentType(ContentType.JSON).build();

            record Accounts(RequestSpecification spec) {
              ValidatableResponse read(int id) {
                return given().spec(spec).pathParam("id", id)
                    .get("/accounts/{id}").then().spec(ACCOUNT_READ);
              }
            }

            @Test
            void readsTheSeededPlan() {
              var token = requireNonNull(System.getenv("ACCOUNT_TEST_TOKEN"), "Test token missing");
              var base = System.getenv().getOrDefault("ACCOUNT_API", "http://localhost:3000");
              var request = new RequestSpecBuilder().setBaseUri(base)
                  .addHeader("Accept", "application/json")
                  .addHeader("Authorization", "Bearer " + token).build();
              new Accounts(request).read(42).body("plan", equalTo("trial"));
            }
          }
---

I'd put the base URI, authentication and media type in a request specification. A response specification is useful for shared outcomes such as a successful account read returning JSON. I'd only share an expectation when it applies to every use of that specification.

Then I'd give the account client a method like `read(id)` so tests don't repeat the route. The test can still show the plan or balance it expects. I build request specs from the test's target and identity rather than changing global settings when tests run in parallel.

### Example

Configure the local service with account 42 on a trial plan and a dedicated test token. The shared response spec expects `200` JSON. The test adds the assertion for `plan: trial`. With REST Assured 7, add `json-path-gpath` for the field assertion.
