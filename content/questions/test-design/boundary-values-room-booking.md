---
title: How would you use boundary value analysis to test a study room's capacity limits?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I'd confirm the allowed range and the smallest possible change in size. I'd test the nearest allowed and rejected sizes at each end.
looksFor:
  - Confirm how party size is measured and whether both limits are allowed.
  - Pick the closest allowed and rejected values at each end.
  - Say which values should create a booking and which should fail.
  - Keep the other booking details valid so you can tell when party size caused the result.
trap: Testing both allowed limits and a typical value without testing just outside either end.
followUps:
  - question: Which cases would you add for three-value boundary coverage?
    answer: I'd test each boundary value and its two neighbors. For whole numbers from 4 to 12, I'd add 2, 5, 11, and 14 to my four two-value cases.
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

I'd ask whether both limits count and whether party size must be a whole number. That tells me which values are neighbors. Boundary value analysis tests at the edges where the result should change. For two-value boundary analysis, I'd pick the closest accepted and rejected size at each end.

I'd use a valid room, time, and account for each test. I'd give each test its own booking slot so one success can't block the next. If the upper-limit check uses less than instead of less than or equal to, only a party at that limit gets a different result.

After submitting, I'd check for a useful error message on rejected sizes. I'd also make sure a rejection never creates a reservation.

### Example

Suppose a library lets groups of 4 through 12 book its larger study room. I'd send each request to the local booking API with its own available slot. For 3 and 13, I'd expect no booking and a `422` reply with `size_out_of_range`. For 4 and 12, I'd expect `201` and a confirmation with the size I sent.
