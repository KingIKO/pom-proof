---
title: "Several automated jobs edit customer addresses. How do you keep their test data apart?"
topic: framework-design
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: "I create one record that only the test owns. I use a setup service and delete only that record."
looksFor:
  - "Create new records the test can edit without going through the browser."
  - "Keep shared reference data read-only."
  - "Use the record ID or run tag to limit what cleanup removes."
  - "Plan for interrupted runs and keep large datasets separate."
trap: "Resetting the same customer account at the start of every test that can run at the same time."
followUps:
  - question: "An abandoned Tacoma record and an active test customer are both in the database. Which can cleanup delete?"
    answer: "I'd delete only the record tagged to a finished run, and only after its expiry window. I'd check the run status and record age. The city doesn't tell me who owns the record."
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

I'd use a factory, code that creates records, to make the smallest valid customer through a setup API. That API lets the test create records directly. I'd use the returned ID for every change and for cleanup. Unique values and a run ID keep jobs that overlap separate. I'd allow shared, read-only data such as the list of states.

If the test worker stops before cleanup, a scheduled job can remove expired records from finished runs. For a load test, I'd create separate data in the sizes and patterns I see in the live app. I wouldn't include real customer details. For a regular address test, I'd use one small made-up record so the case is easier to understand.

### Example

I'd call the local test service to create a customer with a unique email. I'd keep the returned ID. I'd set that customer's city to Tacoma and read it back. I'd remove only the record my test created.
