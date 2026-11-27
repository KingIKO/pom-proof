---
title: "The quotes route is moving and the metro rate stays $4.50. Which parts of the tests should change?"
topic: api
roles: [automation, sdet]
level: senior
type: concept
oneLine: "Change the route in the shipping client and keep the metro-rate expectation in the test that supplies the 500 gram parcel."
looksFor:
  - "Localizes the route edit without changing the parcel or rate in the test."
  - "Reports enough HTTP detail to tell a route failure from a wrong price."
  - "Keeps the environment and test identity configurable without changing the client call."
  - "Shares the quote payload contract without sharing the expected rate or fixture state."
trap: "Baking the metro price into the client's quote method so every caller inherits that expectation."
followUps:
  - question: "One team needs to see expired quotes and another only wants active ones. Where does that difference go?"
    answer: "Give the client a named filter or separate methods if the service exposes distinct operations. Let each test choose its view and state which quotes should appear. A hidden default would make both suites harder to read."
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

I'd aim for one route edit in the shipping client. A quote test should still show the 500 gram parcel and the expected 450 cents, so someone reviewing the route change can see the price expectation stayed put. I'd share the parcel type or quote schema across callers and keep the raw status available so a routing failure looks different from a pricing failure.

It's the same separation I'd use with a page object that owns a locator. Here the fixture supplies the client with the environment and test identity. In CI I'd keep each test's data independent and report the failed operation, expected rate, and request ID.

### Example

Seed the shipping service with a $4.50 metro price for a 500 gram parcel. Point Playwright's `baseURL` or the other clients' `SHIPPING_API` at that service. The client owns `/quotes`. The test expects `200` with `450` minor units and `USD`.
