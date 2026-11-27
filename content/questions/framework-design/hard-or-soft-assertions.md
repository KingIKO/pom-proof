---
title: "A receipt must show four fields. Which failed check should stop the test?"
topic: framework-design
roles: [automation, sdet]
level: junior
type: tooling
oneLine: "I require the heading for R42 first. If I'm on the right receipt, I report all independent wrong fields together."
looksFor:
  - "Name a check that must pass for the later results to mean anything."
  - "Collect only failures that don't depend on each other."
  - "Explain how the runner reports several mismatches from one test."
  - "Check that your own collector fails the test when it finds a mismatch."
trap: "Continuing to write data after a required check fails or logging errors without failing the test."
followUps:
  - question: "In Playwright, pickup and total both fail. What does CI report, and would you still send the receipt?"
    answer: "I'd expect Playwright to report both mismatches and mark the run failed. If sending is the next step, I'd require `test.info().errors` to be empty before I send the receipt."
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

I'd stop the test if I land on the wrong receipt. That's a hard assertion, a check that stops the test if it fails. The delivery and total checks would be misleading on that page. Once I have the right receipt, I'd collect independent failures so someone can see which fields broke in the same run.

I can use a soft assertion in Playwright Test to keep running after a check fails. Playwright still marks the test failed. In JUnit, I'd use `assertAll` to run the group and report its failures together. If my team collects errors itself, I'd add a final check for any failures. Logging a list alone can leave the test marked as passed.

### Example

My local test page shows all the details for receipt R42 at load. I'd require the right heading before checking pickup, the $18 total, and card payment. I'd need pytest-playwright 0.8.0 or newer to use the Python example's soft assertions.
