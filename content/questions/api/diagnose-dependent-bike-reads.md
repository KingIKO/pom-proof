---
title: "A bookmark for bike 42 works only after a catalog visit. What would you compare in the two requests?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "Hold bike 42's availability fixed and compare a bookmarked read before and after the catalog visit."
looksFor:
  - "Makes sure a new reservation didn't change bike 42 between reads."
  - "Checks whether the working request carries context absent from the bookmarked read."
  - "Treats the bike URL as a direct read and checks that the JSON describes the seeded bike."
  - "Repeats the same comparison with the actual selected fields if the screen uses GraphQL."
trap: "Reusing a client that already loaded the catalog, which can hide the dependency."
followUps:
  - question: "Both bookmark requests include the same locale, but only the second works. What would you rule out before filing the bug?"
    answer: "I'd compare the full requests for a cookie, credential or header added during catalog navigation. If they match and bike 42 stayed available, I'd raise the possible dependency on server-held session context."
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

I'd save the request that works and repeat it from a fresh client while bike 42 stays available. If the catalog added a locale or credential, I'd test whether sending that explicitly makes the bookmark work. If identical requests behave differently only after the catalog visit, I'd suspect server-held session context. That's distinct from the bike's reservation state changing between reads.

In REST, `GET` on the bike URL should return the representation using the information in the request. I'd check the JSON state and any links the bookmark view uses next. For GraphQL I'd replay the bookmark's operation and compare its selected data and errors.

### Example

For a public test catalog seeded with bike 42, make a direct request for its JSON representation. Expect `200`, the JSON media type, and bike 42 in the available state.
