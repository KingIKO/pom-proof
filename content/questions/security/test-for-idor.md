---
title: How would you check that signed-in customers can only see invoices they may read?
topic: security
roles: [automation, sdet]
level: mid
type: scenario
oneLine: I'd write down who may read an invoice. I'd check that the server enforces that rule without exposing invoices a customer can't read.
looksFor:
  - Check that the server enforces ownership rules even if the page hides the invoice.
  - Use accounts just for the test, with named roles and known test records.
  - Include an allowed read to show that the invoice API and test sign-in work.
  - Compare replies for denied and missing invoices against the privacy rules.
trap: Checking only that the customer portal menu doesn't show the invoice.
followUps:
  - question: When would you expect 404 for an invoice the customer isn't allowed to read?
    answer: I'd follow the app's documented rules. If the rules hide whether the invoice exists, 404 is a documented option. I'd check that the reply body doesn't tell denied and missing invoices apart.
sources:
  - label: OWASP authorization unit and integration testing
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
  - label: RFC 9110, forbidden resources and masking existence
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.3
  - label: Playwright API request context
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-get
  - label: Playwright assertions
    url: https://playwright.dev/docs/test-assertions
  - label: Requests headers, JSON, and timeouts
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: Requests session headers and lifecycle
    url: https://requests.readthedocs.io/en/latest/user/advanced/#session-objects
  - label: pytest assertions
    url: https://docs.pytest.org/en/stable/how-to/assert.html
  - label: REST Assured request headers
    url: https://rest-assured.io/docs/usage/request-data/
  - label: REST Assured status and body assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
  - label: REST Assured response deserialization
    url: https://rest-assured.io/docs/usage/object-mapping/
  - label: REST Assured 7.0 release notes, JSON GPath module
    url: https://rest-assured.io/release-notes/7-0/
  - label: PEP 8 blank lines for top-level functions
    url: https://peps.python.org/pep-0008/#blank-lines
  - label: JUnit 5 writing tests
    url: https://docs.junit.org/5.14.5/writing-tests/test-classes-and-methods.html
examples:
  - title: Enforce one invoice's read policy in an owned test fixture
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          const endpoint = 'http://localhost:3000/test/invoices';

          test('only the seeded owner can read the invoice', async ({ request }) => {
            const cases = [['fixture-101', 'test-owner'], ['fixture-102', 'test-viewer']];
            for (const [id, token] of cases) {
              const result = await request.get(`${endpoint}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              expect(result.status()).toBe(200);
              expect(await result.json()).toMatchObject({ id });
            }

            const headers = { Authorization: 'Bearer test-viewer' };
            for (const id of ['fixture-101', 'fixture-missing']) {
              const result = await request.get(`${endpoint}/${id}`, { headers });
              expect(result.status()).toBe(404);
              expect(await result.json()).toEqual({ error: 'not_found' });
            }
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import requests

          ENDPOINT = "http://localhost:3000/test/invoices"


          def test_viewer_sees_same_response_for_denied_and_missing():
              owner = requests.get(
                  f"{ENDPOINT}/fixture-101",
                  headers={"Authorization": "Bearer test-owner"},
                  timeout=5,
              )
              assert owner.status_code == 200
              assert owner.json()["id"] == "fixture-101"

              with requests.Session() as viewer:
                  viewer.headers["Authorization"] = "Bearer test-viewer"
                  own = viewer.get(f"{ENDPOINT}/fixture-102", timeout=5)
                  assert own.status_code == 200
                  assert own.json()["id"] == "fixture-102"
                  for id_ in ("fixture-101", "fixture-missing"):
                      result = viewer.get(f"{ENDPOINT}/{id_}", timeout=5)
                      assert result.status_code == 404
                      assert result.json() == {"error": "not_found"}
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import static org.junit.jupiter.api.Assertions.assertEquals;

          import java.util.Map;
          import org.junit.jupiter.api.Test;

          class InvoiceReadPolicyTest {
            static final String ENDPOINT = "http://localhost:3000/test/invoices";

            @Test
            void reportsDeniedAndMissingInvoicesTheSameWay() {
              assertOwnInvoice("test-owner", "fixture-101");
              assertOwnInvoice("test-viewer", "fixture-102");

              for (String id : new String[] {"fixture-101", "fixture-missing"}) {
                var result = given().header("Authorization", "Bearer test-viewer")
                    .when().get(ENDPOINT + "/" + id);
                assertEquals(404, result.statusCode());
                assertEquals(Map.of("error", "not_found"), result.as(Map.class));
              }
            }

            private void assertOwnInvoice(String token, String id) {
              given().header("Authorization", "Bearer " + token)
                  .when().get(ENDPOINT + "/" + id)
                  .then().statusCode(200).body("id", equalTo(id));
            }
          }
---

I'd agree on a permissions table, a list of who may do what. The rules might let the owner read an invoice and deny access to a viewer from another account. The server must decide for every relevant operation. Hiding a button only changes what the customer sees. I'd test the rules with known records and accounts created for the test.

I'd include a successful read for each signed-in session. That checks that a missing record or invalid sign-in didn't make the denials look right. If the rules hide whether records exist, I'd expect the same status for denied and missing invoices. I'd also expect the same error envelope, the fields that describe the error. Neither reply should expose invoice fields.

### Example

I'd use two made-up sessions in the local test app, `test-owner` and `test-viewer`. I'd check that the owner can read `fixture-101` and that the viewer can read `fixture-102`. I'd expect the viewer to get the same `404` JSON error for the owner's invoice and for `fixture-missing`. If I'm using REST Assured 7 to test the API, I'd add `json-path-gpath` to check the `id` field.
