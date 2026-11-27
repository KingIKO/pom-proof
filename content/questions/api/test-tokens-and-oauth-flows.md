---
title: "Team 17's invoice opens with a read token. Which credentials would you swap in to test who can see it?"
topic: api
roles: [automation, sdet]
level: mid
type: scenario
oneLine: "Keep team 17's draft fixed and vary one credential property at a time so each denial has an explanation."
looksFor:
  - "Uses the successful team 17 read as a control for the denied requests."
  - "Changes scope and team membership separately so a denial can be traced to one rule."
  - "Checks the replacement token still respects the original team's access after a refresh."
  - "Can identify which synthetic credential failed without logging a token or invoice data."
trap: "Using a token that is both expired and from the wrong team, then counting the denial as proof of team isolation."
followUps:
  - question: "A team 17 reader refreshes an expired token. Which two invoice reads would you repeat?"
    answer: "I'd reread team 17's draft and try an equivalent draft owned by another team. The replacement should restore the first read without changing the second denial. I'd use the issuer's test clock or short-lived credentials to set up expiry."
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

I'd prove the draft exists with team 17's reader, then keep the URL fixed. A write-only credential from the same team checks scope. A read credential from another team checks ownership. I'd verify the roles for both reads and writes, and make sure a denial doesn't reveal invoice data.

I'd get the tokens from a test issuer or seeded fixtures without scripting sign-in. I'd cover missing, malformed, altered and expired credentials separately. After refresh I'd repeat an allowed and a denied read. For revocation I'd check which tokens stop working and when, according to the issuer. CI supplies the secrets, and I report the case name without the header.

### Example

Seed team 17's draft locally. Set the three environment variables shown in the test to a valid read token, a valid write-only token, and an expired test token. This contract expects `200`, `403`, and `401` respectively.
