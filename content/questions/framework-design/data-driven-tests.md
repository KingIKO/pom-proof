---
title: "How would you test four parcel weight bands without copying the test?"
topic: framework-design
roles: [automation, sdet]
level: junior
type: tooling
oneLine: "I run a named case for each row of the pricing table. If a quote is wrong, I can see which weight band failed."
looksFor:
  - "Read expected prices in cents from the rate table instead of copying them from the quote response."
  - "Give each weight case its own result so one failure doesn't hide the rest."
  - "Explain when moving rates into a separate file helps the people reviewing changes."
  - "Use generated weights to test a rule the four sample cases can't prove."
trap: "Checking every case in one test loop so the first failure hides the results for other weights."
followUps:
  - question: "What could generated weights catch that the sample rows miss?"
    answer: "I could catch a price drop between listed weights. I'd generate pairs and check that the heavier parcel never costs less when I keep everything else the same."
sources:
  - label: Playwright parameterized tests
    url: https://playwright.dev/docs/test-parameterize
  - label: Playwright request context
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: pytest parameterization
    url: https://docs.pytest.org/en/stable/how-to/parametrize.html
  - label: Requests query parameters and JSON
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: JUnit 5 parameterized tests
    url: https://docs.junit.org/5.14.5/writing-tests/parameterized-classes-and-tests.html
  - label: REST Assured usage
    url: https://rest-assured.io/docs/usage/
examples:
  - title: Price one parcel per named case
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          const rates = [[250, 420], [500, 580], [1000, 760], [2000, 990]];
          for (const [grams, cents] of rates) {
            test(`prices ${grams} grams at ${cents} cents`, async ({ request }) => {
              const quote = await request.get('http://localhost:3000/api/quote', {
                params: { grams },
              });
              expect(quote.status()).toBe(200);
              expect(await quote.json()).toMatchObject({ cents });
            });
          }
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import pytest
          import requests

          @pytest.mark.parametrize("grams,cents", [
              pytest.param(250, 420, id="small"),
              pytest.param(500, 580, id="medium"),
              pytest.param(1000, 760, id="large"),
              pytest.param(2000, 990, id="oversize"),
          ])
          def test_parcel_quote(grams, cents):
              response = requests.get(
                  "http://localhost:3000/api/quote", params={"grams": grams}, timeout=5
              )
              assert response.status_code == 200
              assert response.json()["cents"] == cents
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import org.junit.jupiter.params.ParameterizedTest;
          import org.junit.jupiter.params.provider.CsvSource;

          class ParcelQuoteTest {
            @ParameterizedTest(name = "{0} grams costs {1} cents")
            @CsvSource({"250,420", "500,580", "1000,760", "2000,990"})
            void quotesParcel(int grams, int cents) {
              given().queryParam("grams", grams)
                  .get("http://localhost:3000/api/quote")
                  .then().statusCode(200).body("cents", equalTo(cents));
            }
          }
---

I'd write one test for requesting a quote and use a table for weights and expected prices. In a data-driven test, each row supplies inputs and expected results to the same test code. I'd give each case a name in the report. If pricing for the large band changes, I can see that failure without stopping the other cases.

I'd keep a short table in the code so reviewers can see the values beside the check. If another team maintains the rate table, a separate file can help. I'd use one only if the test validates its columns and the review shows what changed. I'd pick examples from a known tariff, or list of rates. A property-based test can generate more inputs and check a rule that should always hold.

### Example

I'd send each parcel weight in grams to the local quote service. I'd expect HTTP 200 and the price in cents from the sample tariff.
