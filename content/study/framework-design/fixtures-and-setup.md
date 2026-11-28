---
title: Fixtures, setup and teardown
module: framework-design
order: 3
level: core
summary: A fixture gives a test a resource it needs and can clean it up afterwards. Choose how long each resource should live.
minutes: 3
prerequisites: [automation-fundamentals/test-independence]
outcomes:
  - Pair setup with cleanup in Playwright Test, pytest or JUnit 5 and later.
  - Explain when to use a per-test fixture and when to set up a whole project.
useWhen:
  - Tests in several files need the same kind of resource, such as a fresh draft.
  - Some cases need extra setup that other cases can skip.
avoidWhen:
  - A shared fixture hands out an account that different tests edit.
  - A short setup step used by just one case is easier to read in place.
practiceTopics: [test-code-review, test-isolation]
questionTopics: [framework-design, playwright]
examples:
  - title: Open a fresh browser resource and close it after the test
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { test as base, expect, type Page } from '@playwright/test';

          const test = base.extend<{ draftTab: Page }>({
            draftTab: async ({ browser }, use) => {
              const context = await browser.newContext();
              try {
                const tab = await context.newPage();
                await tab.goto('data:text/html,<title>Draft%20reports</title>');
                await use(tab);
              } finally {
                await context.close();
              }
            },
          });

          test('shows the draft title', async ({ draftTab }) => {
            await expect(draftTab).toHaveTitle('Draft reports');
          });
      - lang: python
        label: pytest with Selenium 4
        code: |
          import pytest
          from selenium.webdriver import Chrome


          @pytest.fixture
          def draft_tab():
              driver = Chrome()
              try:
                  driver.get("data:text/html,<title>Draft%20reports</title>")
                  yield driver
              finally:
                  driver.quit()


          def test_draft_title(draft_tab):
              assert draft_tab.title == "Draft reports"
      - lang: java
        label: Selenium 4 with JUnit 5 and later
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;

          import org.junit.jupiter.api.AfterEach;
          import org.junit.jupiter.api.BeforeEach;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.chrome.ChromeDriver;

          class DraftTitleTest {
              private WebDriver driver;

              @BeforeEach
              void openDraft() {
                  driver = new ChromeDriver();
                  driver.get("data:text/html,<title>Draft%20reports</title>");
              }

              @AfterEach
              void closeBrowser() {
                  if (driver != null) {
                      driver.quit();
                  }
              }

              @Test
              void showsDraftTitle() {
                  assertEquals("Draft reports", driver.getTitle());
              }
          }
sources:
  - { label: "Playwright: Fixtures", url: "https://playwright.dev/docs/test-fixtures", type: primary }
  - { label: "Playwright: Global setup and teardown", url: "https://playwright.dev/docs/test-global-setup-teardown", type: primary }
  - { label: "pytest: How to use fixtures", url: "https://docs.pytest.org/en/stable/how-to/fixtures.html", type: primary }
  - { label: "JUnit: Annotations", url: "https://docs.junit.org/current/writing-tests/annotations.html", type: primary }
---
## What it is

A fixture gives a test something it needs, such as a browser tab or a draft report. Setup prepares that resource. Teardown closes it or removes it when the test is done.

## How it works

In Playwright Test, `test.extend` adds a named fixture to a new `test` object. The test asks for it by name. Create the resource before calling `await use(value)` and clean it up after that call. The example closes the browser context it created, which ends that separate browser session.

In pytest, a function marked with `@pytest.fixture` can hand its value to the test with `yield`. Pytest resumes the function for teardown. If setup throws before `yield`, code after `yield` will not run. A `finally` block can still close a resource that setup already opened.

In JUnit 5 and later, mark the setup and cleanup methods with `@BeforeEach` and `@AfterEach`. These hooks are methods the runner calls around each ordinary test. The example stores the browser driver in a field so both the test and cleanup can reach it.

## Why it helps

Playwright fixtures keep setup and teardown together. You can reuse them across files or build one fixture on top of another. Ordinary fixtures run on demand, so each test can request the combination it needs. That lets you group tests by behaviour instead of grouping them by their setup.

## When not to use it

Keep one-off setup in the test when it explains the case. Scope means how long a fixture lives. A Playwright test-scoped fixture or a pytest function-scoped fixture gives each test a fresh resource.

In Playwright, `{ scope: 'worker' }` sets up the fixture once in each worker process that uses it. In pytest, define a fixture in `conftest.py` to make it available to nearby test files. Set `scope="session"` to keep it until the test session ends.

Sharing an expensive resource across tests can save time, but a change to shared state can affect the next test. For example, give each test its own cart if it adds or removes items.

For setup that whole Playwright projects need first, use a setup project and list it in their `dependencies`. Playwright recommends this over `globalSetup`. The setup can use fixtures, record traces of its steps and appear in the HTML report.
