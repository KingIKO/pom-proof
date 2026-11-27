---
title: "The quote URL changes, but the metro rate stays $4.50. What would you change in the tests?"
topic: api
roles: [automation, sdet]
level: senior
type: concept
oneLine: "I'd change the path in the shipping client. I'd keep the price in the test that sends the 500 gram parcel."
looksFor:
  - "Change the route in one place without changing the parcel or rate in the test."
  - "Report enough HTTP detail to tell a wrong route from a wrong price."
  - "Let tests change the environment and identity without changing the client call."
  - "Share the shape of the quote data without sharing test records or expected prices."
trap: "Putting the metro price inside the shared quote method so every caller gets the same expectation."
followUps:
  - question: "One team needs expired quotes and another needs only active quotes. Where would you put that choice?"
    answer: "I'd give the client a named filter, or separate methods if the service offers separate operations. I'd let each test choose and say which quotes should appear. A hidden default would make both suites harder to read."
sources:
  - label: Playwright Test fixtures and request
    url: https://playwright.dev/docs/test-fixtures
  - label: Playwright APIRequestContext, POST
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-post
  - label: Playwright request fixture and base URL
    url: https://playwright.dev/docs/api-testing
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: pytest fixtures
    url: https://docs.pytest.org/en/stable/how-to/fixtures.html
  - label: Requests, POST with JSON
    url: https://requests.readthedocs.io/en/latest/user/quickstart/#more-complicated-post-requests
  - label: REST Assured request bodies
    url: https://rest-assured.io/docs/usage/request-data/#request-body
  - label: REST Assured response assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Put the quote route in a shipping client
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { type APIRequestContext, expect, test } from '@playwright/test';

          type Parcel = { grams: number; zone: string };

          class ShippingClient {
            constructor(private http: APIRequestContext) {}

            quote(parcel: Parcel) {
              return this.http.post('/quotes', { data: parcel });
            }
          }

          test('a lightweight parcel gets the metro rate', async ({ request }) => {
            const shipping = new ShippingClient(request);
            const quote = await shipping.quote({ grams: 500, zone: 'metro' });
            expect(quote.status()).toBe(200);
            expect(await quote.json()).toMatchObject({ amountMinor: 450, currency: 'USD' });
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import os

          import pytest
          import requests


          @pytest.fixture
          def quote_parcel():
              base = os.getenv("SHIPPING_API", "http://localhost:3000")

              def quote(*, grams, zone):
                  return requests.post(f"{base}/quotes", json={"grams": grams, "zone": zone}, timeout=5)

              return quote


          def test_lightweight_parcel_metro_rate(quote_parcel):
              response = quote_parcel(grams=500, zone="metro")
              assert response.status_code == 200
              assert response.json()["amountMinor"] == 450
              assert response.json()["currency"] == "USD"
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import io.restassured.response.Response;
          import org.junit.jupiter.api.Test;

          class MetroQuoteTest {
            record ShippingClient(String baseUri) {
              Response quote(int grams, String zone) {
                return given().baseUri(baseUri).contentType("application/json")
                    .body("""
                        {"grams":%d,"zone":"%s"}
                        """.formatted(grams, zone))
                    .post("/quotes");
              }
            }

            @Test
            void appliesTheMetroRate() {
              String base = System.getenv().getOrDefault("SHIPPING_API", "http://localhost:3000");
              new ShippingClient(base).quote(500, "metro").then().statusCode(200)
                  .body("amountMinor", equalTo(450), "currency", equalTo("USD"));
            }
          }
---

I'd change the route, the URL path to the quote operation, in one place in the shipping client. I'd leave the 500 gram parcel and the expected 450 cents visible in the test. A reviewer can then see that the expected price stayed the same. I'd share the parcel type or the schema that describes a quote. I'd keep the actual HTTP status available to tell a routing failure from a wrong price.

I'd make the same split with a page object that decides how to find a control on a screen. Here the fixture, or test setup, gives the client the environment and test identity. In CI, I'd give each test separate data. If one fails, I'd report the operation, expected rate, and request ID.

### Example

I'd set the metro price to $4.50 for a 500 gram parcel in the test service. I'd point Playwright's `baseURL` or the other clients' `SHIPPING_API` at that service. The client uses `/quotes`. I'd expect `200` with `450` minor units and `USD`.
