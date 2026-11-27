---
title: How would you locate a control inside an iframe or shadow DOM?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Before I change the selector, I find out which kind of boundary the control sits behind.
looksFor:
  - Explain that an iframe has a separate document.
  - Show how to target a frame in Playwright.
  - Name the limits around closed shadow roots and XPath.
  - If asked, give the correct Selenium equivalents.
trap: Making the XPath from the main page longer before checking whether the element sits in its own document.
followUps:
  - question: How would you test the component if its shadow root is closed?
    answer: I'd test its public behavior or agree on a component test interface. I wouldn't depend on access to its private nodes.
sources:
  - label: Playwright frames
    url: https://playwright.dev/docs/frames
  - label: Playwright locators and shadow DOM
    url: https://playwright.dev/docs/locators#locate-in-shadow-dom
  - label: Selenium frames
    url: https://www.selenium.dev/documentation/webdriver/interactions/frames/
  - label: Selenium element finders
    url: https://www.selenium.dev/documentation/webdriver/elements/finders/
  - label: Selenium DOM property lookup
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/WebElement.html
  - label: Playwright Python frames and shadow locators
    url: https://playwright.dev/python/docs/locators#locate-in-shadow-dom
  - label: Playwright Python frames
    url: https://playwright.dev/python/docs/frames
examples:
  - title: Use the date input inside the shipping estimate frame
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('sets the shipping date inside the frame', async ({ page }) => {
            await page.goto('http://localhost:3000/shipping/estimate');
            const estimate = page.frameLocator('#shipping-estimate');
            const date = estimate.getByLabel('Delivery date');
            await date.fill('2027-01-12');
            await expect(date).toHaveValue('2027-01-12');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_date_inside_estimate_frame(page):
              page.goto("http://localhost:3000/shipping/estimate")
              frame = page.frame_locator("#shipping-estimate")
              date = frame.get_by_label("Delivery date")
              date.fill("2027-01-12")
              expect(date).to_have_value("2027-01-12")
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.time.Duration;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.ui.ExpectedConditions;
          import org.openqa.selenium.support.ui.WebDriverWait;

          class ShippingEstimateTest {
            @Test
            void setsDateInsideShadowRoot() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/shipping/estimate");
                var wait = new WebDriverWait(driver, Duration.ofSeconds(5));
                wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(
                    By.id("shipping-estimate")));
                var host = driver.findElement(By.cssSelector("delivery-date"));
                var input = host.getShadowRoot().findElement(By.cssSelector("input"));
                input.clear();
                input.sendKeys("2027-01-12");
                assertEquals("2027-01-12", input.getDomProperty("value"));
                driver.switchTo().defaultContent();
              } finally {
                driver.quit();
              }
            }
          }
---

I inspect where the control lives. An iframe is a frame that loads its own document inside the page. In Playwright, I'd use `frameLocator` to reach the frame. Then I'd locate the control within that frame. In Selenium, I'd switch to the frame before searching and switch back when I need the outer page.

A shadow root belongs to a host element. It starts the shadow DOM, a separate tree of elements attached to that host. Playwright locators generally reach into open shadow roots. XPath doesn't cross them, and that locator behavior doesn't support closed roots. In Selenium Java, I'd get the host's shadow root with `getShadowRoot()` and search from the returned context.

### Example

Suppose a shipping estimator sits in a named iframe and uses a custom date component. I'd first locate the frame. Then I'd use the date field's label inside the component's open shadow DOM. I'd assert the resulting estimate on whichever document actually displays it.

In the local fixture, or test page, the date is a labeled text input inside an open shadow root. The check enters an ISO date, written as year-month-day. Then it verifies that the field holds that value.
