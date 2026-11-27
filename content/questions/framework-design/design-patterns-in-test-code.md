---
title: "Several returns tests repeat setup and the same steps. What would you pull into shared code?"
topic: framework-design
roles: [sdet, automation]
level: senior
type: concept
oneLine: "I choose a design pattern, a common way to arrange code, for each repeated job. I let each test own the browser state and data it can change."
looksFor:
  - "Keep repeated page or control interactions in page or component objects."
  - "Use builders or factories for data each test owns."
  - "Show what different needs a facade or strategy would serve."
  - "Explain how one shared driver can break tests that run together."
trap: "Hiding every test behind one generic facade and sharing one browser driver across the suite."
followUps:
  - question: "If the suite adds Firefox alongside Chrome, would you change the helpers that use the form?"
    answer: "I'd try the runner's browser setting first and leave the form helper alone. If the two drivers need different code for the same form action, I'd use a strategy."
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

I'd put repeated screen actions in a page or component object, code for a page or part of one. I'd keep checks for business rules in the tests. I'd use a builder to supply useful defaults so each test can name only the data it changes. A factory can create the record by calling a setup service.

If several tests repeat a whole business task, I'd consider a flow facade, a helper that gives tests one call for those steps.

I'd use a strategy if drivers or clients need different code for a job but tests should use them the same way. A singleton, one instance for the whole suite, is a bad fit for a browser driver. One test can close the session or change the page while another test uses it.

### Example

I'd call a local service that checks return eligibility without saving the order. In each version, I'd build a recent order that would otherwise qualify. I'd change only whether it's final sale and expect the reason `final_sale`.
