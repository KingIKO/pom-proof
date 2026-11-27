---
title: How would you check four parcel-weight bands without copying the test?
topic: framework-design
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Give each tariff row its own case so a wrong quote identifies the weight band that failed.
looksFor:
  - Reads expected cents from the tariff instead of copying prices from the quote endpoint.
  - Gives a failing weight its own name in the report without hiding the other outcomes.
  - Explains when a separate rate file would make the rules easier to review.
  - Uses generated weights for a property the four listed cases can't establish.
trap: Putting every case in a single loop so the first failure hides the rest.
followUps:
  - question: What could generated weights catch that the tariff rows miss?
    answer: They could catch a price drop somewhere between the listed weights. I can generate pairs and check that the heavier parcel never costs less when every other factor stays the same.
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

I'd write one test for how to request a quote and one table for the weights and expected prices. Each row becomes an independent case with its own name in the report. If the large band changes, I can see its failure without preventing the other rows from running.

I'd keep a short table in code so reviewers see the data with the assertion. An external file can suit a rate table maintained by another team, provided the test validates its columns and the review shows what changed. These are deliberate examples from a known tariff. Property-based tests can explore more inputs under a rule that should always hold.

### Example

The local quote endpoint takes parcel weight in grams. Each case expects an HTTP 200 and a price in cents from the sample tariff.
