---
title: "How would you check that two seat reservations can't both win?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Overlap independent booking attempts for one known seat, then check both results and the one reservation that actually committed."
looksFor:
  - "Targets a shared, independently seeded seat with two different intents."
  - "Coordinates the competing calls without relying on a sleep."
  - "Checks the conflict and the identity of the stored winner."
  - "Separates locking or uniqueness from deduplicating retries with an idempotency key."
trap: "Checking only the response codes without reading the committed reservations."
followUps:
  - question: "How would you separately test a retry of the winning booking?"
    answer: "I'd reuse the winning key and equivalent input after a lost response, then check the same logical result and the unchanged count."
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

I'd start with a free seat and use a different client and idempotency key for each attempt. That tests two people competing for the same seat. Reusing one key would test a retry instead. I'd expect one create and one conflict, then read the committed reservation and compare its ID with the winning response.

Sending both calls concurrently is a start. To reproduce a particular overlap I'd use a test-only server barrier before the claim, outside the lock or transaction that must serialize it. The storage rule could be a unique constraint or a lock on the seat row.

### Example

Reset the local service to a free seat B17 for each run. The test uses a fresh key per booking attempt so a prior run can't supply a cached result. It expects `201` and `409` in either order and a list containing just the winner.
