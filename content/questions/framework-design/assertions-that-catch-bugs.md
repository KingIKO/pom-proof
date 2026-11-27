---
title: "A basket test checks only that there's a total. How would you make it catch a wrong price?"
topic: framework-design
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I calculate the price from known inputs. I compare it with the total the customer sees."
looksFor:
  - "Replace a check that always passes with a specific expected result."
  - "Calculate what you expect without reading the amount from the screen."
  - "Show the expected and actual amounts when the check fails."
  - "Keep related checks together when they cover the same behavior."
trap: "Reading the displayed amount and comparing it with itself."
followUps:
  - question: "If checkout shows the discount beside the notebook total, would you check both?"
    answer: "I'd check both if the basket includes a known discount. The two amounts explain what the customer pays. If delivery pricing needs a different address and setup, I'd give it its own test."
sources:
  - label: Playwright assertions
    url: https://playwright.dev/docs/test-assertions
  - label: Playwright Python assertions
    url: https://playwright.dev/python/docs/test-assertions
  - label: Selenium element interactions
    url: https://www.selenium.dev/documentation/webdriver/elements/interactions/
  - label: JUnit 5 assertions
    url: https://docs.junit.org/5.14.5/writing-tests/assertions.html
examples:
  - title: Check the amount for two notebooks
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('basket prices two notebooks at $25', async ({ page }) => {
            await page.goto('http://localhost:3000/cart/sample');
            const expected = '$' + ((2 * 1250) / 100).toFixed(2);
            await expect(page.getByTestId('cart-total')).toHaveText(expected);
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from decimal import Decimal
          from playwright.sync_api import expect

          def test_prices_two_notebooks(page):
              page.goto("http://localhost:3000/cart/sample")
              total = Decimal("12.50") * 2
              expect(page.get_by_test_id("cart-total")).to_have_text(f"${total:.2f}")
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;

          class CartTotalTest {
            @Test
            void pricesTwoNotebooks() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/cart/sample");
                var actual = driver.findElement(By.cssSelector("[data-testid='cart-total']"));
                assertEquals("$25.00", actual.getText(), "two $12.50 notebooks");
              } finally {
                driver.quit();
              }
            }
          }
---

I'd decide which wrong result the test needs to catch. An assertion is a check that compares what happened with what I expected. If the test compares a total with the same value it read from the page, any price passes. I'd start with a basket with known quantities and prices. I'd calculate the charge from the stated rules and compare it with the amount on screen.

I'd show both amounts when the test fails. That helps the next person tell a calculation error from a formatting error. I'd test one behavior at a time, even when it needs several assertions. I can check a discount and the final total together when they're part of the same purchase.

### Example

I'd set up two notebooks at $12.50 each with no tax or delivery charge. When the page shows the completed basket, I'd expect $25.00.
