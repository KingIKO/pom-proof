---
title: "What do you assert after an API returns the expected status?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "Check the response contract, the values that matter to the caller, and the state or side effect the request promised."
looksFor:
  - "Chooses meaningful response fields and headers."
  - "Uses expected values derived from test inputs."
  - "Reads back persisted state or waits on a documented outcome."
  - "Avoids brittle whole-response snapshots."
trap: "Asserting that a field exists without checking whether its value is correct."
followUps:
  - question: "What if the operation completes asynchronously?"
    answer: "I'd assert the immediate acknowledgement, then wait for the promised outcome through the status endpoint or event with a deadline from the test contract."
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

First I check the fields the consumer needs, with values I can predict from the data I sent. I check a response header if the client depends on it, such as content type. For a write, I'd read the resource back or inspect the resulting event. A response echo can look convincing even when the record was saved with different values. I avoid asserting incidental fields that change on every run.

My first priorities are the [response contract](/pom-proof/questions/api/response-schema-testing/) and [access control](/pom-proof/questions/api/authentication-vs-forbidden-vs-not-found/). Next I check rejected inputs and the error bodies the caller uses. Then I check that retries leave the promised number of records. I measure response time separately against the agreed budget so network noise doesn't obscure a functional failure.

### Example

In a disposable invoice service, expect `201` with an identifier, `1299` minor units and `USD`. Then read that ID and expect `200` with the same saved amount and currency. That catches a service that echoes `1299` and stores `12` after a rounding mistake.
