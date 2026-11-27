---
title: A receipt must show four fields. When should its test stop at the first failure?
topic: framework-design
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Require the heading for R42 before checking its details, then report all field mismatches together.
looksFor:
  - Identifies a prerequisite whose failure makes later checks misleading.
  - Collects only independent mismatches.
  - Explains how the runner reports grouped failures.
  - Checks the result of any custom failure collector.
trap: Continuing through another write after a prerequisite failed, or logging collected failures without failing the test.
followUps:
  - question: In the Playwright variant, pickup and total both fail. What does CI report, and would you still send that receipt?
    answer: Both mismatches can be reported and Playwright already marks the run failed. If sending the receipt were the next step, I'd require test.info().errors to be empty before sending it.
sources:
  - label: Playwright soft assertions
    url: https://playwright.dev/docs/test-assertions#soft-assertions
  - label: Playwright locators and assertions
    url: https://playwright.dev/docs/locators
  - label: Playwright Python soft assertions
    url: https://playwright.dev/python/docs/test-assertions#soft-assertions
  - label: Selenium locating receipt fields
    url: https://www.selenium.dev/documentation/webdriver/elements/locators/
  - label: Selenium reading displayed text
    url: https://www.selenium.dev/documentation/webdriver/elements/information/
  - label: JUnit 5 grouped assertions
    url: https://docs.junit.org/5.14.5/writing-tests/assertions.html
examples:
  - title: Check independent fields on receipt R42
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('receipt R42 shows the purchase details', async ({ page }) => {
            await page.goto('http://localhost:3000/receipts/R42');
            await expect(page.getByRole('heading')).toHaveText('Receipt R42');
            await expect.soft(page.getByTestId('delivery')).toHaveText('Pickup');
            await expect.soft(page.getByTestId('total')).toHaveText('$18.00');
            await expect.soft(page.getByTestId('payment-method')).toHaveText('Card');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_receipt_details(page):
              page.goto("http://localhost:3000/receipts/R42")
              expect(page.get_by_role("heading")).to_have_text("Receipt R42")
              fields = {"delivery": "Pickup", "total": "$18.00", "payment-method": "Card"}
              for test_id, expected in fields.items():
                  expect.soft(page.get_by_test_id(test_id)).to_have_text(expected)
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertAll;
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.chrome.ChromeDriver;

          class ReceiptTest {
            @Test
            void reportsIndependentReceiptFieldErrors() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/receipts/R42");
                assertEquals("Receipt R42", driver.findElement(By.tagName("h1")).getText());
                assertAll("receipt details",
                    () -> assertEquals("Pickup", field(driver, "delivery"), "delivery"),
                    () -> assertEquals("$18.00", field(driver, "total"), "total"),
                    () -> assertEquals("Card", field(driver, "payment-method"), "payment"));
              } finally {
                driver.quit();
              }
            }

            private String field(WebDriver driver, String id) {
              return driver.findElement(By.cssSelector("[data-testid='" + id + "']")).getText();
            }
          }
---

I'd stop if I landed on the wrong receipt. Checking its delivery and total after that would add noise. Once I have the right receipt, I'd collect independent mismatches together so someone can see whether both fields broke in the same run.

Playwright Test marks a failed soft assertion as a test failure even if execution continues. In JUnit, `assertAll` runs the group and reports its failures together. If a team builds its own collector, it needs a final assertion on the collected results. A list in a log by itself can leave a bad result green.

### Example

For the local fixture, receipt R42 is rendered with all its details on load. I require the correct heading before checking pickup, the $18 total, and the card payment on the page. The Python example requires pytest-playwright 0.8.0 or newer for soft assertions.
