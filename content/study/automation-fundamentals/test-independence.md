---
title: Test independence and isolation
module: automation-fundamentals
order: 3
level: core
summary: An independent test runs on its own and in any order. Isolate browser state and server data so tests cannot change each other's results.
minutes: 3
prerequisites: [automation-fundamentals/test-anatomy]
outcomes:
  - Explain why a clean browser leaves records in the server database unchanged.
  - Replace a dependency on an earlier test with setup that serves each test.
useWhen:
  - You want to rerun a failed case without running everything that came before it.
avoidWhen:
  - Two tests would update the same order or use a record that only one of them creates.
practiceTopics: [test-isolation]
questionTopics: [playwright, framework-design]
examples:
  - title: A cookie stays inside one test
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { expect, test } from '@playwright/test';

          test('stores a cart cookie', async ({ context }) => {
            await context.addCookies([
              { name: 'cart', value: 'cart-42', url: 'https://shop.example' },
            ]);
            expect(await context.cookies()).toEqual([
              expect.objectContaining({ name: 'cart', value: 'cart-42' }),
            ]);
          });

          test('starts with no cookies', async ({ context }) => {
            expect(await context.cookies()).toEqual([]);
          });
sources:
  - { label: "Playwright: Browser contexts and test isolation", url: "https://playwright.dev/docs/browser-contexts", type: primary }
  - { label: "Playwright: Best practices", url: "https://playwright.dev/docs/best-practices", type: primary }
  - { label: "Selenium: Avoid sharing state", url: "https://www.selenium.dev/documentation/test_practices/encouraged/avoid_sharing_state/", type: primary }
  - { label: "Selenium: Fresh browser per test", url: "https://www.selenium.dev/documentation/test_practices/encouraged/fresh_browser_per_test/", type: primary }
  - { label: "Selenium: Test dependency", url: "https://www.selenium.dev/documentation/test_practices/discouraged/test_dependency/", type: primary }
  - { label: "Cypress: Best practices", url: "https://docs.cypress.io/app/core-concepts/best-practices", type: primary }
---
## What it is

Test independence means a test gives the same result whether it runs alone, after another test or at the same time. Isolation keeps tests from changing the data another test needs. That includes data saved in the browser and records saved on the server.

## How it works

Start from a known browser state. Playwright Test gives each test a fresh browser context, a separate store for browser data such as cookies. The example writes a cookie in one test and starts the next without it. Selenium recommends starting a new browser through WebDriver, its browser control interface, for each test.

A fresh context clears cookies and storage. It does not touch orders saved on the server.

Set up server data separately. If you are testing refunds, give each test its own paid order. Create it through an API, a way for code to call the service directly, if placing the order is outside the check. Remove the records the test owns when it ends. Cypress also recommends setting up state through code where possible.

Cypress recommends resetting any state the next test needs before that test runs. A cleanup function scheduled to run afterwards can be skipped if the run is interrupted.

## Why it helps

If an order creation test fails, an independent refund test still gets an order from its own setup. You can rerun the refund test by itself to investigate. Independent tests can also run in parallel without fighting over the same data.

## When not to use it

Avoid making one test prepare the next, even if sharing an order saves setup time. Share the setup code and have it create a fresh order for each run. If the behaviour requires a sequence, such as issuing a refund and reading its receipt, keep the sequence inside one test.
