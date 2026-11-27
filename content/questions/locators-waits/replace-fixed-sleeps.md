---
title: A test waits five seconds after filtering orders. What would tell you it's ready to continue?
topic: locators-waits
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: I wait for the specific result that lets the next step run.
looksFor:
  - Explain why a fixed delay can be too long and still fail.
  - Use a visible result tied to the submitted query.
  - Investigate a timeout that keeps failing before raising it.
  - Tell synchronization, which means waiting until the app is ready, apart from deliberately testing time.
trap: Making the sleep longer without checking whether the order arrives or the app is failing.
followUps:
  - question: Row A104 appears after 200 milliseconds. If Search must stay disabled for one second, does waiting for that row check the timing rule?
    answer: No. I'd check the disabled period separately. If a clock that the test controls reaches the timer the app uses, I'd use that clock. I'd measure elapsed time only when the actual dependency's timing is part of the requirement.
sources:
  - label: Playwright actionability and retrying assertions
    url: https://playwright.dev/docs/actionability
  - label: Playwright Python retrying assertions
    url: https://playwright.dev/python/docs/test-assertions
  - label: Selenium explicit waits
    url: https://www.selenium.dev/documentation/webdriver/waits/
  - label: Selenium expected conditions
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/ExpectedConditions.html
examples:
  - title: Wait for the completed search to name the matching order
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('finds order A104', async ({ page }) => {
            await page.goto('http://localhost:3000/orders');
            await page.getByLabel('Order number').fill('A104');
            await page.getByRole('button', { name: 'Search' }).click();
            await expect(page.getByRole('status')).toHaveText('1 match for A104');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_finds_order(page):
              page.goto("http://localhost:3000/orders")
              page.get_by_label("Order number").fill("A104")
              page.get_by_role("button", name="Search").click()
              expect(page.get_by_role("status")).to_have_text("1 match for A104")
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import java.time.Duration;
          import java.util.regex.Pattern;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.ui.ExpectedConditions;
          import org.openqa.selenium.support.ui.WebDriverWait;

          class OrderFilterTest {
            @Test
            void waitsForTheRequestedOrder() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/orders");
                driver.findElement(By.id("order-number")).sendKeys("A104");
                driver.findElement(By.id("search-orders")).click();
                new WebDriverWait(driver, Duration.ofSeconds(5)).until(
                    ExpectedConditions.textMatches(
                        By.id("search-status"), Pattern.compile("^1 match for A104$")));
              } finally {
                driver.quit();
              }
            }
          }
---

A fixed sleep pauses the test for a set time. After a fast result, it leaves me waiting. Before a slow result, it can still end too early. So I'd find the state the next step actually needs.

In an order search, that state is the answer to the current filter. A table alone isn't enough, because it may still show old rows. I'd wait for that state with a bounded assertion or an explicit wait. Both check again and again until the state appears or a time limit runs out.

If somebody suggests a longer sleep, I'd compare the failed attempt with a good one. If the search response never came back, waiting longer won't fix it. If the test read a previous result, we can wait for the right one.

### Example

The local order list contains exactly one order A104. The test submits its ID and waits for the search status to say `1 match for A104`.
