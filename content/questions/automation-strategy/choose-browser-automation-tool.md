---
title: How would you choose between Playwright, Selenium, and Cypress?
topic: automation-strategy
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: Compare supported browsers, team experience, and the real flows you need, then test the short list in CI.
looksFor:
  - Required browser, version, and operating system combinations
  - Existing suite and team skills as real migration costs
  - A flow that exposes tool differences
  - Measured diagnostics and execution cost
trap: Picking by a speed claim from someone else's suite or rewriting a working suite on reputation alone.
followUps:
  - question: What would make you keep Selenium?
    answer: A stable Java suite running against required remote browser and operating system combinations can outweigh the convenience of migrating.
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

First I ask what browser and OS versions we actually promise to support. For a TypeScript team starting fresh, I'd try Playwright Test because its runner, browser support, and failure tools fit together. I'd consider Selenium if the team already owns a Java suite and needs remote sessions for specific browser and OS combinations. I'd trial Cypress if the frontend team already uses it to mount and test components in a browser and wants to keep that workflow.

I don't start with a rewrite. I run the same representative checks in CI and compare time to implement, first-attempt reliability, and how long it takes someone else to diagnose a failed run. If a supported browser is missing, fast results can't make up for that.

### Example

For an account portal I'd trial a sign-in redirect and a report download before picking. I'd also make the pilot fail on purpose once and see which run output the on-call teammate can act on.

The local order fixture opens a new tab for its invoice. The same pilot checks that the tab shows `Invoice A104`. I'd compare the implementation and the diagnostics across candidates.
