---
title: How would you use boundary value analysis to test a study room's capacity limits?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Confirm the allowed range and smallest step, then test each edge with its nearest value across the boundary.
looksFor:
  - Confirms the unit and whether the endpoints count.
  - Picks neighboring values on both sides of each cutoff.
  - States which values should create a booking and which should be rejected.
  - Keeps the other booking details valid so the result can be traced to party size.
trap: Checking the two allowed endpoints and a typical value, leaving no test just outside either end.
followUps:
  - question: How would you expand that to three-value boundary coverage?
    answer: Include both neighbors of every partition boundary. For a whole-number range of 4 to 12, that adds 2, 5, 11, and 14 to the four two-value cases around those cutoffs.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: Playwright Test parameterization
    url: https://playwright.dev/docs/test-parameterize
  - label: Playwright API requests
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-post
  - label: pytest parameterization
    url: https://docs.pytest.org/en/stable/how-to/parametrize.html
  - label: Requests JSON POST
    url: https://requests.readthedocs.io/en/latest/user/quickstart/#more-complicated-post-requests
  - label: JUnit 5 parameterized tests
    url: https://docs.junit.org/5.14.5/writing-tests/parameterized-classes-and-tests.html
  - label: REST Assured request bodies
    url: https://rest-assured.io/docs/usage/request-data/#request-body
  - label: REST Assured response assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
examples:
  - title: Booking size at each cutoff
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          const api = 'http://localhost:3000/api/bookings';
          const cases = [[3, 422], [4, 201], [12, 201], [13, 422]];

          for (const [size, status] of cases) {
            test(`party of ${size} returns ${status}`, async ({ request }) => {
              const result = await request.post(api, { data: { size } });
              expect(result.status()).toBe(status);
              expect(await result.json()).toMatchObject(
                status === 201 ? { size } : { error: 'size_out_of_range' },
              );
            });
          }
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import pytest
          import requests

          API = "http://localhost:3000/api/bookings"
          CASES = [(3, 422), (4, 201), (12, 201), (13, 422)]


          @pytest.mark.parametrize("size,status", CASES)
          def test_booking_size(size, status):
              response = requests.post(API, json={"size": size}, timeout=5)
              assert response.status_code == status
              if status == 201:
                  assert response.json()["size"] == size
              else:
                  assert response.json()["error"] == "size_out_of_range"
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import org.junit.jupiter.params.ParameterizedTest;
          import org.junit.jupiter.params.provider.CsvSource;

          class BookingSizeTest {
            private static final String API = "http://localhost:3000/api/bookings";

            @ParameterizedTest
            @CsvSource({ "3,422", "4,201", "12,201", "13,422" })
            void checksBookingSize(int size, int status) {
              var response = given()
                  .contentType("application/json")
                  .body("{\"size\":" + size + "}")
                  .post(API)
                  .then()
                  .statusCode(status);
              if (status == 201) {
                response.body("size", equalTo(size));
              } else {
                response.body("error", equalTo("size_out_of_range"));
              }
            }
          }
---

I'd ask whether the limit includes both ends and whether party size is a whole number. That tells me which values are neighbors. For two-value boundary analysis, I want the closest accepted and rejected value at each cutoff. I'd keep the room, availability, and account valid and use independent bookings so one accepted case doesn't take the slot away from the next.

I'd check the result of submitting the booking. A helpful validation message matters, but so does making sure a rejected size never creates a reservation.

### Example

A library lets groups of 4 through 12 reserve its larger study room. I'd submit 3 and 13 and expect no booking. I'd submit 4 and 12 and expect both confirmations to echo the party size. The example posts to a local booking API with an available slot for each request. It expects `201` with the confirmed size, or `422` with `size_out_of_range`.
