---
title: "The cart charges shipping at exactly $50. Which two quote requests would help find the bug?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd compare a quote at $49.99 with one at $50.00. I'd use the results to decide whether to look at the pricing service or the cart."
looksFor:
  - "State the exact subtotals and shipping charges you expect."
  - "Explain what you'd check in the cart if the quote is already right."
  - "Send the cutoff requests directly instead of going through checkout each time."
  - "Test arithmetic separately and check that the service reads the subtotal correctly."
trap: "Testing a cart far above $50 and missing the first subtotal that should get free shipping."
followUps:
  - question: "The quote is zero cents at $50, but checkout shows $5.99. What would you check in the browser?"
    answer: "I'd watch the cart cross the cutoff. I'd check whether it requests a new quote and displays the reply. I'd also check whether the final total uses the new amount."
sources:
  - label: Ham Vocke, the practical test pyramid
    url: https://martinfowler.com/articles/practical-test-pyramid.html
  - label: Playwright APIRequestContext, GET query parameters
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-get
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests, passing parameters in URLs
    url: https://requests.readthedocs.io/en/latest/user/quickstart/#passing-parameters-in-urls
  - label: pytest parameterized cases
    url: https://docs.pytest.org/en/stable/how-to/parametrize.html
  - label: REST Assured request parameters
    url: https://rest-assured.io/docs/usage/request-data/
  - label: REST Assured response assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
  - label: JUnit 5 parameterized tests
    url: https://docs.junit.org/5.14.5/writing-tests/parameterized-classes-and-tests.html
examples:
  - title: Test the two sides of the free-shipping cutoff
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          for (const [subtotal, shipping] of [[4999, 599], [5000, 0]]) {
            test(`shipping for a subtotal of ${subtotal}`, async ({ request }) => {
              const quote = await request.get('http://localhost:3000/shipping-quote', {
                params: { subtotal },
              });
              expect(quote.status()).toBe(200);
              expect(await quote.json()).toMatchObject({ shippingMinor: shipping });
            });
          }
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import pytest
          import requests


          @pytest.mark.parametrize("subtotal,shipping", [(4999, 599), (5000, 0)])
          def test_free_shipping_cutoff(subtotal, shipping):
              response = requests.get(
                  "http://localhost:3000/shipping-quote",
                  params={"subtotal": subtotal},
                  timeout=5,
              )
              assert response.status_code == 200
              assert response.json()["shippingMinor"] == shipping
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import org.junit.jupiter.params.ParameterizedTest;
          import org.junit.jupiter.params.provider.CsvSource;

          class ShippingCutoffTest {
            @ParameterizedTest
            @CsvSource({"4999,599", "5000,0"})
            void checksTheCutoff(int subtotal, int shipping) {
              given().queryParam("subtotal", subtotal)
                  .get("http://localhost:3000/shipping-quote").then()
                  .statusCode(200).body("shippingMinor", equalTo(shipping));
            }
          }
---

I'd send $49.99 and $50.00 to the running quote service. If it charges shipping at both amounts, I'd check how it reads the subtotal and applies the cutoff. If the second quote is free, I'd check whether the cart uses the new result. Two direct requests usually answer that faster than changing items and waiting for the page to update.

I'd keep the arithmetic cases in unit tests, which check the pricing code on its own. I'd keep the two requests as checks of the running service. I'd still go through checkout once in a browser to see that it shows and charges the right amount.

### Example

In the local service, I'd quote 4999 and 5000 cents and read the `shippingMinor` field. I'd expect $5.99 below $50 and no charge at $50.
