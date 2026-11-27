---
title: Several CI jobs edit customer addresses. How would you keep their test data separate?
topic: framework-design
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: Create one uniquely owned record per test through a setup interface and delete only that record.
looksFor:
  - Builds new mutable records below the UI.
  - Distinguishes shared read-only reference data.
  - Limits cleanup by record ID or run tag.
  - Plans for crashes and keeps large datasets separate.
trap: Resetting the same customer account at the start of every test in a parallel suite.
followUps:
  - question: An abandoned Tacoma record and an active test customer are both in the database. Which one can the cleanup job delete?
    answer: Only the record tagged to the finished run, and only after its expiry window. I'd use the run state and age for that decision since the city alone doesn't tell me who owns the record.
sources:
  - label: Playwright request context
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: pytest fixture teardown
    url: https://docs.pytest.org/en/stable/how-to/fixtures.html
  - label: Requests quickstart
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: REST Assured request and response data
    url: https://rest-assured.io/docs/usage/
  - label: Node.js random UUID
    url: https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
examples:
  - title: Update one customer and remove it by ID
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { randomUUID } from 'node:crypto';
          import { expect, test } from '@playwright/test';

          test.use({ baseURL: 'http://localhost:3000' });

          test('an address update sticks to this customer', async ({ request }) => {
            const email = `${randomUUID()}@example.test`;
            const created = await request.post('/api/test/customers', { data: { email } });
            expect(created.status()).toBe(201);
            const { id } = await created.json();
            const url = `/api/test/customers/${id}`;
            try {
              const updated = await request.patch(url, { data: { city: 'Tacoma' } });
              expect(updated.ok()).toBe(true);
              const current = await request.get(url);
              expect(await current.json()).toMatchObject({ email, city: 'Tacoma' });
            } finally {
              expect((await request.delete(url)).status()).toBe(204);
            }
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          from uuid import uuid4
          import pytest
          import requests

          @pytest.fixture
          def customer():
              api = "http://localhost:3000/api/test/customers"
              email = f"{uuid4()}@example.test"
              created = requests.post(api, json={"email": email}, timeout=5)
              assert created.status_code == 201
              url = f"{api}/{created.json()['id']}"
              yield url, email
              assert requests.delete(url, timeout=5).status_code == 204

          def test_updates_owned_customer(customer):
              url, email = customer
              assert requests.patch(url, json={"city": "Tacoma"}, timeout=5).ok
              current = requests.get(url, timeout=5)
              current.raise_for_status()
              assert (current.json()["email"], current.json()["city"]) == (email, "Tacoma")
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import java.util.UUID;
          import org.junit.jupiter.api.Test;

          class CustomerAddressTest {
            @Test
            void updatesOnlyOwnedCustomer() {
              String api = "http://localhost:3000/api/test/customers";
              String email = UUID.randomUUID() + "@example.test";
              String id = given().contentType("application/json")
                  .body("{\"email\":\"" + email + "\"}")
                  .post(api).then().statusCode(201).extract().path("id");
              String url = api + "/" + id;
              try {
                given().contentType("application/json").body("{\"city\":\"Tacoma\"}")
                    .patch(url).then().statusCode(200);
                given().get(url).then().statusCode(200)
                    .body("email", equalTo(email)).body("city", equalTo("Tacoma"));
              } finally {
                given().delete(url).then().statusCode(204);
              }
            }
          }
---

I'd make a factory create the smallest valid customer through a setup API. The test gets its ID and uses it for every write and for cleanup. Unique values and a run ID keep concurrent jobs separate. Shared reference data, like the list of states, can stay read-only. If the worker dies before teardown, a scheduled cleanup can expire records tied to finished runs.

For a load test, I'd build a separate dataset with the sizes and distributions we see in production, without exposing real customer details. Ordinary address tests are easier to understand with a small synthetic record.

### Example

The local test API creates a customer with a unique email and returns its ID. The check sets that customer's city to Tacoma, reads the change back, then deletes the one record it owns.
