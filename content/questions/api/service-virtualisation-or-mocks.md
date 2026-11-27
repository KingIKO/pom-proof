---
title: "The carrier returns 503, but checkout shows no quote error. Where would you put the test double?"
topic: api
roles: [sdet]
level: senior
type: concept
oneLine: "I'd point the real shipping client at a test carrier URL. I'd check that the client turns the 503 into the quote error checkout expects."
looksFor:
  - "Keep the real code that reads the carrier's reply in the test."
  - "Use a fixed reply when the check needs no shipment history."
  - "Keep each run's test carrier separate if other tests change its replies."
  - "Say what the test proves about the chosen reply and what it leaves open."
trap: "Replacing the quote handler itself and skipping the code that reads the carrier's response."
followUps:
  - question: "One team tests a slow reply and another tests recovery. Can they use the same simulator?"
    answer: "I'd share the setup but let each run control its own URL or instance. Otherwise, one test can change the reply while another is waiting for it."
sources:
  - label: WireMock delays and faults
    url: https://wiremock.org/docs/simulating-faults/
  - label: WireMock recording and playback
    url: https://wiremock.org/docs/record-playback/
  - label: RFC 9110, 503 Service Unavailable
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15.6.4
  - label: Playwright APIRequestContext, GET
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-get
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests response JSON and status
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: REST Assured response assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
  - label: REST Assured 7, JSON path setup
    url: https://rest-assured.io/release-notes/7-0/
examples:
  - title: Check the quote service with a simulated carrier outage
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('a carrier outage produces a retryable quote error', async ({ request }) => {
            const quote = await request.get('http://localhost:3000/quotes/standard');
            expect(quote.status()).toBe(503);
            expect(await quote.json()).toMatchObject({ code: 'carrier_unavailable' });
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import requests


          def test_quote_reports_carrier_outage():
              quote = requests.get("http://localhost:3000/quotes/standard", timeout=5)
              assert (quote.status_code, quote.json()["code"]) == (503, "carrier_unavailable")
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static org.hamcrest.Matchers.equalTo;
          import org.junit.jupiter.api.Test;

          class CarrierOutageTest {
            @Test
            void returnsTheQuoteErrorContract() {
              given().get("http://localhost:3000/quotes/standard").then()
                  .statusCode(503).body("code", equalTo("carrier_unavailable"));
            }
          }
---

I'd put a test double, a substitute for the real carrier, behind the carrier URL. I'd use WireMock to send one fixed HTTP reply. I'd ask the shipping service for a quote and see what error it sends to checkout. If I hand the fallback code an error inside the same process, the code that interprets the HTTP reply never runs.

I'd reuse the setup for a delayed reply or dropped connection. If I need to track a shipment as its status changes, I'd consider writing a fake service that stores its state. I'd keep a separate test in the real carrier's sandbox. A recorded reply may no longer match what the carrier sends.

### Example

I'd point the local quote service at a WireMock carrier that returns `503` for standard shipping. I'd expect our service to return `503` with `carrier_unavailable`.
