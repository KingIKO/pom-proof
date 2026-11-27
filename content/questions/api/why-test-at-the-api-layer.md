---
title: "The cart charges shipping at exactly $50. Which two requests would narrow down the bug?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "Compare the shipping quotes at $49.99 and $50.00 before deciding whether to investigate the pricing service or the cart."
looksFor:
  - "Names the exact subtotals and expected shipping amounts."
  - "Explains what to inspect in the cart if the quote is already correct."
  - "Keeps the cutoff requests below the slower browser journey."
  - "Leaves arithmetic variations in unit tests and checks that the service reads the subtotal correctly."
trap: "Testing a cart far above $50 and missing the first subtotal that should qualify."
followUps:
  - question: "The quote returns zero cents at $50, but checkout still shows $5.99. What would you check in the browser?"
    answer: "I'd watch the cart cross the cutoff and see whether it requests a new quote, displays that reply, and uses it in the final total."
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

I'd ask the running quote service for $49.99 and then $50.00. If it charges at both, I'd check how it reads the subtotal and applies the cutoff. If the second quote is free, I'd turn to the cart and check whether it uses the new result. Two direct requests usually give me that answer faster than changing items and waiting for a page update.

I'd keep the arithmetic variations in unit tests and the two requests as service checks. I'd still keep one browser checkout to prove that the new shipping price is displayed and included in what the shopper pays.

### Example

A local quote service charges $5.99 below $50 and nothing at $50. Two requests check `shippingMinor` at 4999 and 5000 cents.
