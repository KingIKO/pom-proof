---
title: "Team 17's invoice opens with a read token. Which credentials would you swap in to test who can see it?"
topic: api
roles: [automation, sdet]
level: mid
type: scenario
oneLine: "I'd keep team 17's draft fixed. I'd change one thing about the token at a time so I can tell why each read is denied."
looksFor:
  - "Read the draft with team 17's valid token before trying requests that should fail."
  - "Change the allowed action and team membership separately to tell which rule blocked a request."
  - "After refreshing the token, check that it keeps the same limits on team access."
  - "Name the test credential that failed without logging a token or invoice details."
trap: "Using a token that's both expired and from the wrong team, then treating rejection as proof of team isolation."
followUps:
  - question: "A team 17 reader refreshes an expired token. Which two invoice reads would you repeat?"
    answer: "I'd try team 17's draft and an equivalent draft that belongs to another team. I'd expect the first read to work and the second to stay blocked. I'd set up expiry with the issuer's test clock or short-lived credentials."
sources:
  - label: RFC 6749, OAuth token grants and refresh
    url: https://www.rfc-editor.org/rfc/rfc6749.html
  - label: RFC 6750, bearer token error responses
    url: https://www.rfc-editor.org/rfc/rfc6750.html#section-3.1
  - label: RFC 7009, token revocation behavior
    url: https://www.rfc-editor.org/rfc/rfc7009.html#section-2.1
  - label: Playwright APIRequestContext, request headers
    url: https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-get
  - label: Playwright fixture configuration and authorization headers
    url: https://playwright.dev/docs/api-testing
  - label: Playwright test.use and extraHTTPHeaders
    url: https://playwright.dev/docs/test-use-options
  - label: Playwright APIResponse
    url: https://playwright.dev/docs/api/class-apiresponse
  - label: Requests custom headers and response status
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: pytest parameterized cases
    url: https://docs.pytest.org/en/stable/how-to/parametrize.html
  - label: REST Assured authentication
    url: https://rest-assured.io/docs/usage/authentication/
  - label: JUnit 5 parameterized tests
    url: https://docs.junit.org/5.14.5/writing-tests/parameterized-classes-and-tests.html
examples:
  - title: Distinguish an expired token from an insufficient scope
    variants:
      - lang: ts
        label: Playwright Test request fixture (TypeScript)
        code: |
          /// <reference types="node" />
          import { expect, test } from '@playwright/test';

          const cases = [
            ['INVOICE_READ_TOKEN', 200],
            ['INVOICE_WRITE_ONLY_TOKEN', 403],
            ['INVOICE_EXPIRED_TOKEN', 401],
          ] as const;

          for (const [name, status] of cases) {
            test.describe(name, () => {
              test.use({
                extraHTTPHeaders: async ({}, use) => {
                  const token = process.env[name];
                  if (!token) throw new Error(`Missing test credential: ${name}`);
                  await use({ Authorization: `Bearer ${token}` });
                },
              });

              test(`invoice read returns ${status}`, async ({ request }) => {
                const result = await request.get('http://localhost:3000/invoices/team-17-draft');
                expect(result.status()).toBe(status);
              });
            });
          }
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import os

          import pytest
          import requests


          @pytest.mark.parametrize("name,status", [
              ("INVOICE_READ_TOKEN", 200),
              ("INVOICE_WRITE_ONLY_TOKEN", 403),
              ("INVOICE_EXPIRED_TOKEN", 401),
          ])
          def test_invoice_read_permission(name, status):
              response = requests.get(
                  "http://localhost:3000/invoices/team-17-draft",
                  headers={"Authorization": f"Bearer {os.environ[name]}"},
                  timeout=5,
              )
              assert response.status_code == status
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static java.util.Objects.requireNonNull;
          import org.junit.jupiter.params.ParameterizedTest;
          import org.junit.jupiter.params.provider.CsvSource;

          class InvoicePermissionTest {
            @ParameterizedTest
            @CsvSource({"INVOICE_READ_TOKEN,200", "INVOICE_WRITE_ONLY_TOKEN,403",
                        "INVOICE_EXPIRED_TOKEN,401"})
            void checksStatusForCredential(String name, int status) {
              var token = requireNonNull(System.getenv(name), "Missing test credential: " + name);
              given().auth().oauth2(token)
                  .get("http://localhost:3000/invoices/team-17-draft")
                  .then().statusCode(status);
            }
          }
---

I'd read the draft with team 17's reader to show it exists. Then I'd keep the URL fixed. A write-only token from the same team checks scope, the actions the token allows. A read token from another team checks ownership. I'd check read and write permissions and make sure a denial never reveals invoice data.

I'd get credentials from a test issuer, the service that makes tokens, or from prepared test data instead of scripting sign-in. I'd check missing, badly formatted, changed, and expired tokens separately. After refresh gives me a replacement, I'd repeat a permitted and a blocked read. If access is revoked, I'd check which tokens stop working and when, according to the issuer's rules. I'd get secrets from CI and report the case name without the credential header.

### Example

I'd set up team 17's draft locally. I'd use the three test environment variables for a valid read token, a valid write-only token, and an expired test token. I'd expect `200`, `403`, and `401` in that order.
