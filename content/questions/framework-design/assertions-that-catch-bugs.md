---
title: A basket test only checks that a total exists. How would you make it catch a pricing bug?
topic: framework-design
roles: [automation, sdet]
level: mid
type: concept
oneLine: Compute the expected total from known inputs and compare it with the amount the customer sees.
looksFor:
  - Replaces a meaningless assertion with a specific expectation.
  - Keeps the expected value independent of the UI output.
  - Makes expected and actual values clear on failure.
  - Groups related assertions around one behavior.
trap: Reading the displayed total and comparing it with itself.
followUps:
  - question: Checkout now shows the discount beside the notebook total. Would you check both amounts in this case?
    answer: I'd check both if the basket setup includes a known discount, since together they explain what the customer pays. I'd give delivery pricing its own case if it requires a different address and setup.
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

I'd start by asking what wrong result the test should catch. If it only asserts that the total equals the value it just read from the page, any price can pass. I would seed a basket with known units and prices, calculate what should be charged from the stated rules, and compare that with the displayed amount.

I want a failure message to show both values so the next person can distinguish a calculation error from a formatting error. I use one behavior per test rather than one assertion per test. Checking a discount and final total together can make sense if they describe the same purchase.

### Example

The seeded basket contains two notebooks at $12.50 each, without tax or delivery. The page serves the completed basket and should display $25.00.
