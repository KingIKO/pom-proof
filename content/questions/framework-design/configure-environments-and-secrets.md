---
title: How would you run the same billing smoke test in staging and a temporary environment?
topic: framework-design
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Select the environment once, validate the resolved configuration before running tests, and inject credentials from CI.
looksFor:
  - Defines an explicit precedence for defaults and job values.
  - Validates the URL and required credentials before tests run.
  - Keeps secrets out of source, logs, and reports.
  - Adds a target through configuration rather than code.
trap: Switching environments by editing the test source or printing all resolved settings after a failure.
followUps:
  - question: A temporary billing environment has its own URL but no token. What should the smoke job do?
    answer: It should stop and name BILLING_TOKEN without printing a value or falling back to staging. I'd add the scoped credential to that CI environment entry so the same job input can select the target without a code change.
sources:
  - label: Node.js environment variables
    url: https://nodejs.org/api/process.html#processenv
  - label: Playwright request context
    url: https://playwright.dev/docs/api/class-apirequestcontext
  - label: Python environment variables
    url: https://docs.python.org/3/library/os.html#os.environ
  - label: Requests quickstart
    url: https://requests.readthedocs.io/en/latest/user/quickstart/
  - label: Java environment variables
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html#getenv(java.lang.String)
  - label: Java URI parsing
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/URI.html
  - label: REST Assured request headers
    url: https://rest-assured.io/docs/usage/request-data/#headers
  - label: REST Assured status assertions
    url: https://rest-assured.io/docs/usage/verifying-responses/
examples:
  - title: Load a billing health target once
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { env } from 'node:process';
          import { expect, test } from '@playwright/test';

          function required(name: string): string {
            const value = env[name];
            if (!value?.trim()) throw new Error(`Missing ${name}`);
            return value;
          }

          const config = {
            health: new URL('/health', required('BILLING_URL')),
            token: required('BILLING_TOKEN'),
          };
          if (!['https:', 'http:'].includes(config.health.protocol)) {
            throw new Error('Invalid BILLING_URL protocol');
          }

          test('billing reports healthy', async ({ request }) => {
            const result = await request.get(config.health.href, {
              headers: { Authorization: `Bearer ${config.token}` },
            });
            expect(result.status()).toBe(200);
          });
      - lang: python
        label: pytest and Requests (Python)
        code: |
          import os
          from dataclasses import dataclass
          from urllib.parse import urlsplit
          import requests

          @dataclass(frozen=True)
          class Config:
              host: str
              token: str

          config = Config(os.environ["BILLING_URL"], os.environ["BILLING_TOKEN"])
          address = urlsplit(config.host)
          if address.scheme not in ("http", "https") or not address.hostname or not config.token.strip():
              raise ValueError("Invalid billing configuration")

          def test_billing_health():
              result = requests.get(
                  f"{address.scheme}://{address.netloc}/health",
                  headers={"Authorization": f"Bearer {config.token}"},
                  timeout=5,
              )
              assert result.status_code == 200
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import java.net.URI;
          import java.util.Set;
          import org.junit.jupiter.api.Test;

          class BillingHealthTest {
            record Config(URI health, String token) {}
            static final Config CONFIG = loadConfig();

            static Config loadConfig() {
              var host = URI.create(required("BILLING_URL"));
              if (host.getHost() == null || !Set.of("https", "http").contains(host.getScheme())) {
                throw new IllegalArgumentException("Invalid BILLING_URL");
              }
              return new Config(host.resolve("/health"), required("BILLING_TOKEN"));
            }

            static String required(String key) {
              String value = System.getenv(key);
              if (value == null || value.isBlank()) throw new IllegalStateException("Missing " + key);
              return value;
            }

            @Test
            void billingIsHealthy() {
              given().header("Authorization", "Bearer " + CONFIG.token())
                  .get(CONFIG.health()).then().statusCode(200);
            }
          }
---

I'd have one CI input choose the environment. The selected entry supplies the base URL and injects the credential from the secret store at startup. I'd document precedence: keep local defaults for harmless settings, let the job override them, and require the credential rather than invent a default. Tests read one configuration object whose values are checked before the suite runs.

A missing setting should name the setting so someone can fix it. I'd keep the value out of errors and restrict artifacts that might record authorization headers. Pipeline masking helps with logs, but I would still avoid printing secrets in the first place.

### Example

Each environment supplies `BILLING_URL` and `BILLING_TOKEN` to the same test. The protected health endpoint should return 200 when accessed with that environment's token.
