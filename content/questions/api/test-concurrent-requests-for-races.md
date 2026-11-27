---
title: "How would you prove that only one of two requests can reserve the same seat?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I'd make two independent attempts overlap. I'd check both replies and read the one reservation the service saved."
looksFor:
  - "Set up one seat that two separate test clients try to reserve."
  - "Make the requests overlap without guessing how long to wait."
  - "Check the conflict reply and the identity of the saved winner."
  - "Explain why preventing two bookings differs from ignoring a repeat of the same request."
trap: "Checking only the reply codes and never reading the saved reservations."
followUps:
  - question: "How would you test retrying the winning booking in a separate case?"
    answer: "I'd drop the first reply and retry with the winning key and equivalent inputs. I'd check that the reply identifies the same booking and the booking count stays the same."
sources:
  - label: RFC 9110, 409 Conflict
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.10
  - label: Stripe, idempotency keys and retries
    url: https://docs.stripe.com/api/idempotent_requests
  - label: PostgreSQL row locks
    url: https://www.postgresql.org/docs/current/explicit-locking.html
  - label: Playwright APIRequestContext, HTTP methods
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: MDN, Promise.all
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
  - label: Node.js 24, Web Crypto API
    url: https://nodejs.org/docs/latest-v24.x/api/webcrypto.html
  - label: Requests HTTP methods and response data
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: Python ThreadPoolExecutor
    url: https://docs.python.org/3/library/concurrent.futures.html
  - label: Python UUID generation
    url: https://docs.python.org/3/library/uuid.html
  - label: REST Assured requests and responses
    url: https://rest-assured.io/docs/usage/examples/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
  - label: Java 21 Executors
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Executors.html
  - label: Java 21 UUID generation
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/UUID.html#randomUUID()
  - label: JUnit 5 assertions
    url: https://docs.junit.org/5.14.5/writing-tests/assertions.html
examples:
  - title: Compare the success with the single stored reservation
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('only one client reserves seat B17', async ({ request }) => {
            const path = 'http://localhost:3000/seats/B17/reservations';
            const runId = crypto.randomUUID();
            const results = await Promise.all(['east', 'west'].map((client) =>
              request.post(path, {
                data: { client },
                headers: { 'Idempotency-Key': `${runId}-${client}` },
              }),
            ));
            expect(results.map((response) => response.status()).sort()).toEqual([201, 409]);
            const index = results[0].status() === 201 ? 0 : 1;
            const winner = await results[index].json();
            expect(winner.id).toEqual(expect.any(String));
            const stored = await request.get(path);
            expect(stored.status()).toBe(200);
            expect(await stored.json()).toMatchObject([{ id: winner.id }]);
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          from concurrent.futures import ThreadPoolExecutor
          from uuid import uuid4

          import requests

          PATH = "http://localhost:3000/seats/B17/reservations"


          def reserve(client, key):
              return requests.post(
                  PATH, json={"client": client}, headers={"Idempotency-Key": key}, timeout=5,
              )


          def test_only_one_reservation_survives():
              run_id = uuid4()
              with ThreadPoolExecutor(max_workers=2) as pool:
                  pending = [
                      pool.submit(reserve, client, f"{run_id}-{client}") for client in ("east", "west")
                  ]
                  results = [future.result() for future in pending]
              assert sorted(result.status_code for result in results) == [201, 409]
              winner = next(result.json()["id"] for result in results if result.status_code == 201)
              assert isinstance(winner, str) and winner
              stored = requests.get(PATH, timeout=5)
              assert stored.status_code == 200
              assert [reservation["id"] for reservation in stored.json()] == [winner]
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.contains;
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import static org.junit.jupiter.api.Assertions.assertNotNull;
          import io.restassured.response.Response;
          import java.util.List;
          import java.util.UUID;
          import java.util.concurrent.Executors;
          import org.junit.jupiter.api.Test;

          class SeatRaceTest {
            private static final String PATH = "http://localhost:3000/seats/B17/reservations";

            private Response reserve(String client, UUID runId) {
              return given().header("Idempotency-Key", runId + "-" + client)
                  .contentType("application/json")
                  .body("{\"client\":\"" + client + "\"}")
                  .post(PATH);
            }

            @Test
            void onlyOneRequestWins() throws Exception {
              UUID runId = UUID.randomUUID();
              try (var pool = Executors.newFixedThreadPool(2)) {
                var east = pool.submit(() -> reserve("east", runId));
                var west = pool.submit(() -> reserve("west", runId));
                var a = east.get();
                var b = west.get();
                var statuses = List.of(a.statusCode(), b.statusCode()).stream().sorted().toList();
                assertEquals(List.of(201, 409), statuses);
                String winner = (a.statusCode() == 201 ? a : b).path("id");
                assertNotNull(winner);
                given().get(PATH).then().statusCode(200).body("id", contains(winner));
              }
            }
          }
---

I'd start with a free seat. I'd give each request a different client and idempotency key, which marks repeat attempts at the same booking. Reusing a key would test a retry. I'd expect one booking and one conflict. I'd read the saved reservation and compare its ID with the winning reply.

I'd start by sending both calls at the same time. To repeat a specific overlap, I'd use a test-only barrier to hold the calls before either claims the seat. I'd put that barrier outside the lock or transaction that makes the claims take turns. The database could use a unique constraint, a rule that allows only one booking per seat. It could also lock the seat's row while saving.

### Example

I'd reset the local service so seat B17 is free. I'd use a fresh key for each attempt so a prior run can't give me a saved reply. I'd expect `201` and `409` in either order and a reservation list containing only the winner.
