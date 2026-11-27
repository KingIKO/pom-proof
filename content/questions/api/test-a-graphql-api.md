---
title: "Guests and staff open the same order screen. Which parts of the GraphQL reply should differ?"
topic: api
roles: [automation, sdet]
level: senior
type: concept
oneLine: "I'd run the screen's request as both users. I'd check that the screen can still show public fields when it can't show a private one."
looksFor:
  - "Read as staff first to show that the test note exists."
  - "Check that a guest still gets the order ID and that the error names the note field."
  - "Rerun the screen's saved requests when the schema changes."
  - "Use more test data to tell slow field processing from the API's documented query limit."
trap: "Treating HTTP 200 as proof that every requested field came back successfully."
followUps:
  - question: "The guest gets a null note with no error. What would you check before reporting a bug?"
    answer: "I'd check that staff can see the test note. I'd check whether the API promises a field error to guests or intends to return null with no error."
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

I'd use the order screen's actual GraphQL query, which names the fields the client wants back. I'd add a test note staff can read and run the same query as a guest. I'd check that the guest still gets the order ID without seeing the note. HTTP `200` can carry a partial result. I'd check `data` and the field path in `errors` together.

I'd save the screen's queries and mutations, its read and change requests, to rerun when the schema changes. If staff can edit a note, I'd read it back after the edit. I'd test many line items and measure time in the resolvers, the code that fetches each field. I'd also count their storage calls. I'd separately try requests on either side of the documented depth or cost limit and see which ones the server accepts.

### Example

In the local test API, I'd use a guest to read a demo order. The staff-only `internalNote` field can hold null, and the resolver reports an error. I'd expect `200`, ID `61`, a null note, and the error path `order.internalNote`.
