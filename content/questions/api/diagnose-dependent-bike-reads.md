---
title: "The bookmark for bike 42 works only after a catalog visit. What would you compare?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd keep bike 42 available. I'd compare the bookmark request and result before and after visiting the catalog."
looksFor:
  - "Check that no reservation changed bike 42 between reads."
  - "Look for information in the working request that the direct read doesn't send."
  - "Request the bike URL directly and check that the JSON shows the test bike."
  - "If the screen uses GraphQL, compare requests with the fields the screen actually asks for."
trap: "Using a client that already opened the catalog and hiding a state the bookmark might depend on."
followUps:
  - question: "Both bookmark requests send the same language setting, but only the second works. What would you rule out before reporting a bug?"
    answer: "I'd check for a cookie, credential, or header that the catalog visit added. If the requests match and bike 42 stayed available, I'd flag a possible dependency on session data stored by the server."
sources:
  - label: Fielding, REST architectural constraints and resource representations
    url: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
  - label: RFC 9110, GET semantics and representations
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.1
  - label: GraphQL specification, operations and selections
    url: https://spec.graphql.org/September2025/
  - label: Playwright APIRequestContext, GET and headers
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-get
  - label: Playwright APIResponse status and headers
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests headers and JSON responses
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: REST Assured request and response examples
    url: https://rest-assured.io/docs/usage/examples/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Read a bike resource without a prior session step
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('reads a seeded bike directly as JSON', async ({ request }) => {
            const bike = await request.get('http://localhost:3000/bikes/42', {
              headers: { Accept: 'application/json' },
            });
            expect(bike.status()).toBe(200);
            expect(bike.headers()['content-type']).toMatch(/^application\/json\b/);
            expect(await bike.json()).toMatchObject({ id: 42, state: 'available' });
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import requests


          def test_independent_bike_read():
              response = requests.get(
                  "http://localhost:3000/bikes/42",
                  headers={"Accept": "application/json"},
                  timeout=5,
              )
              assert response.status_code == 200
              assert response.headers["Content-Type"].split(";")[0] == "application/json"
              bike = response.json()
              assert (bike["id"], bike["state"]) == (42, "available")
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import io.restassured.http.ContentType;
          import org.junit.jupiter.api.Test;

          class BikeResourceTest {
            @Test
            void readsThePublicBike() {
              given().accept(ContentType.JSON)
                  .pathParam("id", 42)
                  .get("http://localhost:3000/bikes/{id}").then()
                  .statusCode(200).contentType(ContentType.JSON)
                  .body("id", equalTo(42), "state", equalTo("available"));
            }
          }
---

I'd save the working request and repeat it from a fresh client while bike 42 stays available. If visiting the catalog added a locale, such as a language preference, or a credential, I'd see whether sending it makes the bookmark work. If the same request works only after the visit, I'd suspect the server remembers something about the client's session. I'd check that separately from any change in the bike's reservation.

In REST, I'd expect a `GET` request to the bike URL to return the bike using the information in that request. I'd check the details in the JSON response and any links the bookmark page uses next. If the screen uses GraphQL, I'd repeat its query with the exact fields it asks for. I'd compare the data and errors.

### Example

I'd add bike 42 to a public test catalog and request it directly as JSON. I'd expect `200`, a content type for JSON, and bike 42 marked available.
