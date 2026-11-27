---
title: "A reading-list API returns 200 for every action. Which statuses would you test?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "Use the status family to interpret the response and assert the exact status promised for each outcome."
looksFor:
  - "Explains all five HTTP status families."
  - "Distinguishes successful reads, creates, and empty responses."
  - "Separates credential errors, bad input, and conflicts with current state."
  - "Treats the endpoint contract as the source of the expected code."
trap: "Accepting any 2xx response when the client needs a body to display a successful read."
followUps:
  - question: "The reading list adds books in the background. What would a 202 check leave unproven?"
    answer: "202 means the request was accepted for processing. I'd also check the documented completion signal and verify that the book actually appears in the list."
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

I use the first digit for orientation: 1xx means information, 2xx success, 3xx redirection, 4xx a client error and 5xx a server error. Then I check the exact status the caller relies on. A read may promise `200` with a representation, a create `201`, and a delete `204` with no content.

For errors I'd separate missing or invalid credentials (`401`) from refusal (`403`). `400` is a general client error. `422` fits content the server understands but cannot process. `409` signals a conflict with the resource's current state. The API's own contract determines which case gets which code.

### Example

Against a disposable reading list, create a book and read the returned ID before deleting it. The contract promises `201`, `200` with the title, and `204`, in that order.
