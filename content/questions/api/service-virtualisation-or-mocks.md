---
title: "The carrier sends 503, but checkout shows no quote error. Where would you put the test double?"
topic: api
roles: [sdet]
level: senior
type: concept
oneLine: "Replace the carrier at its HTTP address so the real shipping client must turn its 503 into the quote error checkout expects."
looksFor:
  - "Keeps the code that interprets the carrier's reply in the running test."
  - "Starts with a canned reply because this quote check needs no shipment history."
  - "Keeps the quote fixture isolated when other suites change the simulator's behavior."
  - "Limits the conclusion to how checkout handles the configured reply."
trap: "Stubbing the quote handler itself, which leaves the carrier client out of the test again."
followUps:
  - question: "One team is testing a slow carrier and another is testing recovery. Can they share the same simulator?"
    answer: "They can share its setup, but each run should control its own endpoint or instance. Otherwise one suite can change the response while the other is waiting for it."
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

I'd put the double behind the carrier URL. For this check I need one canned reply from WireMock, then I can ask the shipping service for a quote and see which error it gives checkout. With an in-process mock that hands the fallback a finished error, the code that reads the HTTP reply never runs.

A different suite can reuse that setup with a delayed reply or a dropped connection. I'd consider a hand-written fake if the test needs to follow a shipment as its status changes. I'd keep a separate real sandbox check because a recording can keep replaying a reply the carrier no longer sends.

### Example

Configure the local quote service to talk to a WireMock carrier that returns `503` for standard shipping. Expect our service to return `503` with `carrier_unavailable`.
