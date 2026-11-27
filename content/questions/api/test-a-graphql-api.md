---
title: "Guests and staff open the same order screen. What should their GraphQL responses show?"
topic: api
roles: [automation, sdet]
level: senior
type: concept
oneLine: "Run the screen's operation with both identities, and assert that public fields still render when a private field is denied."
looksFor:
  - "Uses a staff read to prove the seeded note really exists."
  - "Checks that guest data keeps the order ID and reports the note error at the correct path."
  - "Replays the screen's saved operations when the schema changes."
  - "Uses a larger fixture to distinguish slow resolver work from a documented query limit."
trap: "Treating HTTP 200 as proof every requested field resolved successfully."
followUps:
  - question: "The guest query returns a null note without an error. What would you check before calling it a bug?"
    answer: "I'd check the staff response for the seeded note and confirm whether the guest contract promises a field error or intentionally returns a silent null."
sources:
  - label: GraphQL specification, response and field errors
    url: https://spec.graphql.org/September2025/#sec-Response
  - label: GraphQL over HTTP draft, response status by media type
    url: https://http-spec.graphql.org/draft/
  - label: Apollo GraphOS, operation depth and cost limits
    url: https://www.apollographql.com/docs/graphos/platform/security/overview
  - label: Playwright APIRequestContext, JSON request data
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-post
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests, sending JSON
    url: https://requests.readthedocs.io/en/latest/user/quickstart/#more-complicated-post-requests
  - label: REST Assured request bodies
    url: https://rest-assured.io/docs/usage/request-data/#request-body
  - label: REST Assured response assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Check an order with one field-level access error
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('a guest can read an order id but not its internal note', async ({ request }) => {
            const result = await request.post('http://localhost:3000/graphql', {
              data: { query: '{ order(id: "61") { id internalNote } }' },
            });
            expect(result.status()).toBe(200);
            expect(await result.json()).toMatchObject({
              data: { order: { id: '61', internalNote: null } },
              errors: [{ path: ['order', 'internalNote'] }],
            });
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import requests


          def test_guest_cannot_read_internal_note():
              result = requests.post(
                  "http://localhost:3000/graphql",
                  json={"query": '{ order(id: "61") { id internalNote } }'},
                  timeout=5,
              )
              assert result.status_code == 200
              body = result.json()
              assert body["data"]["order"] == {"id": "61", "internalNote": None}
              assert [error["path"] for error in body["errors"]] == [["order", "internalNote"]]
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.contains;
          import static org.hamcrest.Matchers.equalTo;
          import static org.hamcrest.Matchers.hasSize;
          import static org.hamcrest.Matchers.nullValue;
          import org.junit.jupiter.api.Test;

          class OrderQueryTest {
            @Test
            void deniesTheNoteButKeepsTheOrderId() {
              given().contentType("application/json")
                  .body("""
                      {"query":"{ order(id: \\"61\\") { id internalNote } }"}
                      """)
                  .post("http://localhost:3000/graphql").then().statusCode(200)
                  .body("data.order.id", equalTo("61"), "data.order.internalNote", nullValue())
                  .body("errors", hasSize(1), "errors[0].path", contains("order", "internalNote"));
            }
          }
---

I'd take the order screen's actual query and seed a note I know staff can read. Then I'd run the same query as a guest. I want the screen to keep the order ID without exposing the note. HTTP `200` can carry that partial result, so I'd check `data` and the path in `errors` together.

I'd save the screen's queries and mutations as compatibility checks. If staff can edit a note, I'd read the edit back. I'd run the order query with many line items and look at resolver time and storage calls. Separately I'd use operations on either side of the documented depth or cost limit and check which ones the server admits.

### Example

The local graph lets a guest read a demo order's ID. Its nullable `internalNote` is staff-only and the resolver reports a field error. Expect `200`, ID `61`, a null note, and the error path `order.internalNote`.
