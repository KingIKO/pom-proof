---
title: "How would you pick Playwright, Selenium, or Cypress for your browser tests?"
topic: automation-strategy
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: "I'd compare browser support and what the team already knows. I'd run the same important flows with each contender in CI."
looksFor:
  - "List the browser versions and operating systems you must support."
  - "Count what it costs to replace the suite or learn a new tool."
  - "Pick a flow that shows where the tools differ."
  - "Measure the work to run tests and investigate failures."
trap: "Picking by someone else's speed results or replacing a working suite because another tool is popular."
followUps:
  - question: "When would you keep Selenium?"
    answer: "If a stable Java suite already covers the required remote browsers and operating systems, I'd weigh that against what I'd gain by moving."
sources:
  - label: Playwright browsers
    url: https://playwright.dev/docs/browsers
  - label: Selenium Grid
    url: https://www.selenium.dev/documentation/grid/
  - label: Cypress cross-browser testing
    url: https://docs.cypress.io/app/guides/cross-browser-testing
  - label: Cypress component testing
    url: https://docs.cypress.io/app/component-testing/get-started
  - label: Playwright introductory guide
    url: https://playwright.dev/docs/intro
  - label: Playwright popups
    url: https://playwright.dev/docs/pages
  - label: Playwright Python popups
    url: https://playwright.dev/python/docs/pages
  - label: Selenium windows and tabs
    url: https://www.selenium.dev/documentation/webdriver/interactions/windows/
examples:
  - title: Compare how a tool handles an invoice popup
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('invoice opens in a new tab', async ({ page }) => {
            await page.goto('http://localhost:3000/orders/A104');
            const popupPromise = page.waitForEvent('popup');
            await page.getByRole('link', { name: 'View invoice' }).click();
            const invoice = await popupPromise;
            await expect(invoice.getByRole('heading')).toHaveText('Invoice A104');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_invoice_opens_in_new_tab(page):
              page.goto("http://localhost:3000/orders/A104")
              with page.expect_popup() as event:
                  page.get_by_role("link", name="View invoice").click()
              expect(event.value.get_by_role("heading")).to_have_text("Invoice A104")
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.time.Duration;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.ui.WebDriverWait;

          class InvoiceTabTest {
            @Test
            void opensInvoiceInNewTab() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/orders/A104");
                var original = driver.getWindowHandle();
                driver.findElement(By.linkText("View invoice")).click();
                var wait = new WebDriverWait(driver, Duration.ofSeconds(5));
                var invoice = wait.until(d -> d.getWindowHandles().stream()
                    .filter(handle -> !handle.equals(original)).findFirst().orElse(null));
                driver.switchTo().window(invoice);
                var heading = wait.until(d -> d.findElement(By.tagName("h1"))).getText();
                assertEquals("Invoice A104", heading);
              } finally {
                driver.quit();
              }
            }
          }
---

I start with the browser and operating system versions we support. If a TypeScript team is starting fresh, I'd try Playwright Test because its runner, browser support, and failure reports work together. If we have Java tests and need specific remote browser and operating system combinations, I'd consider Selenium. If the frontend team already uses Cypress to test components in a browser and wants to keep doing that, I'd try Cypress.

I wouldn't start by rewriting the suite. I'd run the same checks in continuous integration (CI), the service that runs checks on code changes. I'd measure how long each test takes to write and how often it passes on the first try. I'd ask someone else to time how long a failure takes to explain.

If a tool can't test a browser we support, I'd rule it out regardless of speed.

### Example

I'd try a sign-in redirect and a report download for an account portal. I'd make a test fail once on purpose and ask what the on-call teammate can tell from the report. I'd also use the local order's invoice, which opens in a new tab. I'd check for `Invoice A104` and compare the code and failure details across tools.
