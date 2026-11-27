---
title: "A reading-list API returns 200 for every action. Which status codes would you check?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd use the first digit to tell what kind of reply I got. I'd check the exact status the API promises for each outcome."
looksFor:
  - "Explain what the five HTTP status families tell the client."
  - "Give separate examples for a successful read, a new record, and a reply with no body."
  - "Tell credential errors, bad input, and conflicts with current state apart."
  - "Use the API's documented promise to choose the expected code."
trap: "Accepting any 2xx when the client needs a body to show a successful read."
followUps:
  - question: "Adding a book runs in the background. What does a 202 leave unproven?"
    answer: "I'd treat 202 as accepted for processing. I'd look for the documented signal that the work finished and check that the book appears in the list."
sources:
  - label: RFC 9110, HTTP status codes
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15
  - label: Playwright API requests and response access
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests HTTP methods and response status
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: REST Assured response assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
  - label: REST Assured extraction
    url: https://rest-assured.io/docs/usage/response-data/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Assert the exact status at each step in a list item's lifecycle
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('a reading-list item is created, read and removed', async ({ request }) => {
            const items = 'http://localhost:3000/reading-list';
            const created = await request.post(items, { data: { title: 'North Pier' } });
            expect(created.status()).toBe(201);
            const { id } = await created.json();
            expect(typeof id).toBe('string');
            const url = `${items}/${id}`;
            const read = await request.get(url);
            expect(read.status()).toBe(200);
            expect(await read.json()).toMatchObject({ title: 'North Pier' });
            const removed = await request.delete(url);
            expect(removed.status()).toBe(204);
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import requests

          ITEMS = "http://localhost:3000/reading-list"


          def test_reading_list_lifecycle():
              made = requests.post(ITEMS, json={"title": "North Pier"}, timeout=5)
              assert made.status_code == 201
              url = f"{ITEMS}/{made.json()['id']}"
              found = requests.get(url, timeout=5)
              assert found.status_code == 200
              assert found.json()["title"] == "North Pier"
              gone = requests.delete(url, timeout=5)
              assert gone.status_code == 204
              assert gone.content == b""
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import static org.hamcrest.Matchers.notNullValue;
          import org.junit.jupiter.api.Test;

          class ReadingListStatusTest {
            private static final String ITEMS = "http://localhost:3000/reading-list";

            @Test
            void checksTheItemLifecycle() {
              String id = given().contentType("application/json")
                  .body("""
                      {"title":"North Pier"}
                      """)
                  .post(ITEMS).then().statusCode(201).body("id", notNullValue())
                  .extract().path("id");
              given().pathParam("id", id).get(ITEMS + "/{id}").then()
                  .statusCode(200).body("title", equalTo("North Pier"));
              given().pathParam("id", id).delete(ITEMS + "/{id}").then().statusCode(204);
            }
          }
---

I read the first digit to tell what kind of reply I got. The 1xx family is for information, and 2xx means success. The 3xx family is for redirection. A 4xx points to a client error, and a 5xx points to a server error. I still check the exact code the API promises.

A read may promise `200` with a record, a create `201`, and a delete `204` with no body. I'd tell missing or invalid credentials (`401`) apart from refusal (`403`). `400` covers general client errors. `422` fits a request the server can read but can't carry out. `409` signals a conflict with the record's current state.

### Example

I'd create a book in a disposable reading list and use the returned ID to read it. I'd then delete it. For this API, I'd expect `201`, then `200` with the title, then `204`.
