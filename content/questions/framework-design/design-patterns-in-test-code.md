---
title: A returns suite repeats setup and user flows. What would you extract?
topic: framework-design
roles: [sdet, automation]
level: senior
type: concept
oneLine: Choose a pattern for each repeated job and keep mutable browser and data resources owned by the test.
looksFor:
  - Uses page and component objects for UI interactions.
  - Applies builders or factories to test-owned data.
  - Connects facades and strategies to actual variation.
  - Recognizes the parallel-run cost of a single shared driver.
trap: Hiding every test behind a generic scenario facade and sharing one driver across the suite.
followUps:
  - question: The returns suite adds Firefox alongside Chrome. Would you change the objects that drive the return form?
    answer: I'd try the runner's browser setting first and leave the form object alone. I'd add a strategy if two actual driver implementations needed different ways to carry out the same form operation.
sources:
  - label: Playwright page object models
    url: https://playwright.dev/docs/pom
  - label: Selenium avoiding shared state
    url: https://www.selenium.dev/documentation/test_practices/encouraged/avoid_sharing_state/
  - label: Playwright request context
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: Requests JSON POST
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: Python dataclass replacement
    url: https://docs.python.org/3/library/dataclasses.html#dataclasses.replace
  - label: REST Assured request and response data
    url: https://rest-assured.io/docs/usage/
examples:
  - title: Build a return-policy input with one deliberate override
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          function order(overrides: Partial<{ daysOld: number; finalSale: boolean }> = {}) {
            return { daysOld: 5, finalSale: false, ...overrides };
          }

          test('final sale overrides age eligibility', async ({ request }) => {
            const result = await request.post('http://localhost:3000/api/return-eligibility', {
              data: order({ finalSale: true }),
            });
            expect(result.status()).toBe(200);
            expect(await result.json()).toMatchObject({ eligible: false, reason: 'final_sale' });
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          from dataclasses import dataclass, replace
          import requests

          @dataclass(frozen=True)
          class Order:
              days_old: int = 5
              final_sale: bool = False

              def payload(self):
                  return {"daysOld": self.days_old, "finalSale": self.final_sale}

          def test_final_sale_is_ineligible():
              item = replace(Order(), final_sale=True)
              response = requests.post(
                  "http://localhost:3000/api/return-eligibility", json=item.payload(), timeout=5
              )
              assert response.status_code == 200
              assert response.json()["reason"] == "final_sale"
              assert response.json()["eligible"] is False
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import org.junit.jupiter.api.Test;

          class FinalSaleTest {
            record Order(int daysOld, boolean finalSale) {
              static Order recent() { return new Order(5, false); }
              Order asFinalSale() { return new Order(daysOld, true); }
              String json() {
                return """
                    {"daysOld":%d,"finalSale":%b}
                    """.formatted(daysOld, finalSale);
              }
            }

            @Test
            void finalSaleIsIneligible() {
              given().contentType("application/json").body(Order.recent().asFinalSale().json())
                  .post("http://localhost:3000/api/return-eligibility")
                  .then().statusCode(200)
                  .body("eligible", equalTo(false)).body("reason", equalTo("final_sale"));
            }
          }
---

I'd give recurring controls a page or component object and keep business expectations in the test. A builder supplies useful data defaults so each test can name the one change it cares about. A factory can then create the record through a setup API. A small flow facade helps if several tests repeat the same complete business operation.

I'd use a strategy only when we have interchangeable drivers or clients that need the same test-facing interface. A single shared driver is a bad use of the singleton pattern: one test can close the session or change the page while another uses it.

### Example

The local eligibility endpoint evaluates an order without saving it. Each variant builds an otherwise returnable recent order and changes only final-sale status. It expects the specific reason `final_sale`.
