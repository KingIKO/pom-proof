---
title: "Inventory reports nine marker packs available, but three are reserved. Which regression belongs at the endpoint?"
topic: api
roles: [automation, sdet]
level: junior
type: concept
oneLine: "Seed nine packs with three reservations and check that the inventory endpoint reports six available."
looksFor:
  - "Uses different on-hand and reserved counts so a bad column lookup changes the result."
  - "Checks the exact total in the endpoint's public response for the seeded SKU."
  - "Works back from a wrong total to the query and the value passed to the calculator."
  - "Keeps calculator cases separate, where inputs can be varied without resetting stock."
trap: "Stubbing the reservation count in the endpoint test and masking the bad column lookup."
followUps:
  - question: "The service reads three reservations and the calculator returns six, but the JSON says nine. Where would you look?"
    answer: "I'd trace the response field back to the calculated value. The serializer or response model may be filling availablePacks from the on-hand count."
sources:
  - label: Ham Vocke, unit tests and integration tests
    url: https://martinfowler.com/articles/practical-test-pyramid.html
  - label: Playwright APIRequestContext, GET
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-get
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests response JSON and status
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: REST Assured request and response examples
    url: https://rest-assured.io/docs/usage/examples/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Check that the stock endpoint reads the reserved quantity
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('available stock excludes reserved packs', async ({ request }) => {
            const result = await request.get('http://localhost:3000/inventory/marker-pack');
            expect(result.status()).toBe(200);
            expect(await result.json()).toMatchObject({ availablePacks: 6 });
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import requests


          def test_reported_stock_excludes_reservations():
              result = requests.get("http://localhost:3000/inventory/marker-pack", timeout=5)
              assert result.status_code == 200
              assert result.json()["availablePacks"] == 6
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import org.junit.jupiter.api.Test;

          class StockEndpointTest {
            @Test
            void subtractsStoredReservations() {
              given().pathParam("sku", "marker-pack")
                  .get("http://localhost:3000/inventory/{sku}").then()
                  .statusCode(200).body("availablePacks", equalTo(6));
            }
          }
---

I'd keep the regression at the inventory endpoint. A seeded SKU with nine packs and three reservations gives me distinct values to trace from storage through the calculator to `availablePacks`. If the service reads the wrong column and feeds the calculator zero reservations, that fixture exposes it. Going through the running endpoint also exercises routing, input validation, and serialization.

I'd pass the two counts directly to the calculator in a unit test. A double can supply a dependency when needed. That's where I'd vary the arithmetic cases without rebuilding the inventory fixture every time.

### Example

Seed nine marker packs with three reserved. The running inventory service should return `200` with `availablePacks` equal to six.
