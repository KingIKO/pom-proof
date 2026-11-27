---
title: "How would you run the same quick billing check in staging and a temporary test environment?"
topic: framework-design
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I choose the environment once and check the settings before the test runs. I supply the credentials from the automated job."
looksFor:
  - "Say which settings win if the job and local defaults both provide a value."
  - "Check the URL and required credentials before running the tests."
  - "Keep credentials out of code, logs, and reports."
  - "Add an environment through settings without editing tests."
trap: "Editing the test to switch environments or printing all settings when a job fails."
followUps:
  - question: "If a temporary billing environment has a URL but no token, what should the job do?"
    answer: "I'd stop the job and name `BILLING_TOKEN` without printing its value or using staging instead. I'd add a credential for that environment so the same job input can select it without a code change."
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

I'd use one continuous integration (CI) input to choose the environment. CI runs the test job automatically. The chosen settings provide the base URL, the starting address for requests. I'd supply the credential from the secret store when the job starts.

I'd document which value wins when settings overlap. I allow local defaults for harmless settings and let the job override them. I require the credential instead of making up a default. Tests read one set of settings. I check those values before running the suite.

If a setting is missing, I'd name it so someone can fix it. I'd leave its value out of errors. I'd restrict access to saved reports that may contain authorization headers, which can carry credentials. CI can hide known secret values in logs, but I'd still avoid printing them.

### Example

I'd give each environment its own `BILLING_URL` and `BILLING_TOKEN` for the same test. When I use that environment's token at the protected health address, I'd expect status code 200.
