---
title: "After an API returns the expected status, what else do you check?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I'd check what the API promises to return and the values the client uses. I'd also check what the request actually did."
looksFor:
  - "Check the response fields and headers the caller uses."
  - "Work out the expected values from the test inputs."
  - "Read the saved record or wait for an outcome the API promises."
  - "Avoid comparing a saved copy of the entire response if unrelated values can change."
trap: "Checking that a field exists without checking its value."
followUps:
  - question: "What if the operation finishes after the API responds?"
    answer: "I'd check the immediate reply. I'd wait for the promised result through the status endpoint or event, using the deadline in the test contract."
sources:
  - label: "MDN, HTTP response status codes"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
  - label: Playwright APIRequestContext, POST and GET
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests JSON request and response data
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: REST Assured request bodies
    url: https://rest-assured.io/docs/usage/request-data/#request-body
  - label: REST Assured verifying and extracting response data
    url: https://rest-assured.io/docs/usage/response-data/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Check the invoice response and the saved invoice
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('the invoice keeps its minor-unit amount on read-back', async ({ request }) => {
            const invoices = 'http://localhost:3000/invoices';
            const input = { totalMinor: 1299, currency: 'USD' };
            const created = await request.post(invoices, { data: input });
            expect(created.status()).toBe(201);
            const invoice = await created.json();
            expect(invoice).toMatchObject({ id: expect.any(String), ...input });
            const loaded = await request.get(`${invoices}/${invoice.id}`);
            expect(loaded.status()).toBe(200);
            expect(await loaded.json()).toMatchObject({ id: invoice.id, ...input });
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import requests


          def test_saved_invoice_retains_minor_units():
              invoices = "http://localhost:3000/invoices"
              payload = {"totalMinor": 1299, "currency": "USD"}
              created = requests.post(invoices, json=payload, timeout=5)
              assert created.status_code == 201
              body = created.json()
              assert {key: body[key] for key in payload} == payload
              loaded = requests.get(f"{invoices}/{body['id']}", timeout=5)
              assert loaded.status_code == 200
              saved = loaded.json()
              assert saved["id"] == body["id"]
              assert {key: saved[key] for key in payload} == payload
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import static org.hamcrest.Matchers.notNullValue;
          import org.junit.jupiter.api.Test;

          class InvoiceReadBackTest {
            private static final String INVOICES = "http://localhost:3000/invoices";

            @Test
            void storesTheAmountAndCurrency() {
              String id = given().contentType("application/json")
                  .body("""
                      {"totalMinor":1299,"currency":"USD"}
                      """)
                  .post(INVOICES).then().statusCode(201).body("id", notNullValue())
                  .body("totalMinor", equalTo(1299), "currency", equalTo("USD"))
                  .extract().path("id");
              given().pathParam("id", id).get(INVOICES + "/{id}").then().statusCode(200)
                  .body("id", equalTo(id), "totalMinor", equalTo(1299), "currency", equalTo("USD"));
            }
          }
---

I check the fields the caller needs and predict their values from the data I send. I check a response header if the client uses it, such as the content type that says how to read the body. If a request saves something, I'd read it back or check the event it creates. The response can repeat what I sent even if the service saves a different value. I skip unrelated fields that change on every run.

I start with the [response contract](/pom-proof/questions/api/response-schema-testing/), what the API promises to send, and [access control](/pom-proof/questions/api/authentication-vs-forbidden-vs-not-found/). I check which inputs the API rejects and the error details clients use. I check how many records are left after retries. I'd measure response time against the agreed limit in a separate check. That way, network delays won't obscure a failure in what the API does.

### Example

On a disposable invoice service, I'd expect `201` with an ID, `1299` minor units, and `USD`. I'd read that ID and expect `200` with the same saved amount and currency. This catches a rounding mistake where the API returns `1299` but stores `12`.
