---
title: "Several account tests repeat the same REST Assured setup. What would you extract?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd share request settings and common response checks in specifications. I'd put repeated paths in a small client."
looksFor:
  - "Give the account client one place for request settings and one place for checks that apply to successful reads."
  - "Share only settings and checks that every caller of the specification needs."
  - "Let each test set its own credentials and record IDs."
  - "Show the expected business result where the test calls the client."
trap: "Using a shared success check in a test that expects an error."
followUps:
  - question: "How would you test a request that should be refused without a token?"
    answer: "I'd use a request specification without the token. I'd check the documented rejection with a separate response specification or checks in that test."
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

I'd use a request specification, a reusable set of settings, for authentication, the base URI, and the media type. The base URI is the starting address for requests. The media type names a format for the body, such as JSON.

A response specification is a reusable set of checks. I'd use one to check that a successful account read returns JSON. I'd share a check only if it applies each time I use that specification.

I'd add a method like `read(id)` to the account client so tests don't repeat the path. The test would still say which plan or balance it expects. If tests run in parallel, I'd build each request specification from its own target and identity instead of changing global settings.

### Example

I'd set up account 42 on a trial plan in the local service. I'd use a dedicated test token. The shared response specification expects `200` and JSON. I'd add the check for `plan: trial` in the test. With REST Assured 7, I'd use `json-path-gpath` for that field check.
