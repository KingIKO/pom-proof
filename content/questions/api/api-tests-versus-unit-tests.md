---
title: "Inventory reports nine marker packs available, but three are reserved. Which regression test belongs at the endpoint?"
topic: api
roles: [automation, sdet]
level: junior
type: concept
oneLine: "I'd set up nine packs with three reserved. I'd check that the inventory endpoint reports six available."
looksFor:
  - "Use different counts for packs in stock and packs reserved so the wrong column gives the wrong result."
  - "Check the exact available count in the public response for the test item."
  - "Trace a wrong total back to the database query and the count sent to the calculator."
  - "Test the calculator separately so each case can supply counts without resetting stock."
trap: "Supplying a fake reservation count to the endpoint test and hiding the mistake that reads the wrong column."
followUps:
  - question: "The service reads three reservations, and the calculator returns six, but the JSON says nine. Where would you look?"
    answer: "I'd trace availablePacks back to the calculated value. The response model, which defines the reply fields, may use the count in stock. The serializer, which turns the reply into JSON, may also use the wrong count."
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

I'd use the inventory endpoint, the URL the client calls for inventory, for the regression test that catches this bug if it returns. I'd set up a test SKU, or stock item code, with nine packs and three reservations. I can trace those counts from storage through the calculator to the `availablePacks` response field. If the service reads the wrong column and gives the calculator zero reservations, the test exposes it.

Calling the running endpoint also checks routing, which sends the request to the right code. It checks input validation and serialization, the step that puts the result in the reply.

I'd test the arithmetic separately by passing both counts straight to the calculator. If the calculator needs another component, a test double can act in its place. I can vary the counts without setting up inventory again.

### Example

I'd add nine marker packs and reserve three. I'd expect the running service to return `200` and set `availablePacks` to six.
