---
title: How do explicit and implicit waits differ in Selenium?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Keep element lookup time separate from the explicit wait for a specific page state.
looksFor:
  - Implicit wait applies to element lookup
  - Explicit wait polls a condition with a timeout
  - Nested lookup can stretch observed timeouts
  - A condition tied to the user's next step
trap: Combining both wait types and adding a sleep when the combined timing looks unpredictable.
followUps:
  - question: What would you wait for after submitting a form?
    answer: I'd wait for its real result, such as the confirmation for the submitted record, rather than assume finding the Submit button proves success.
  - question: What does a fluent wait let you change?
    answer: I can set the polling interval and name the transient exceptions to ignore. I'd ignore only errors expected before the condition is ready.
sources:
  - label: Selenium waits
    url: https://www.selenium.dev/documentation/webdriver/waits/
  - label: Selenium Java expected conditions
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/ExpectedConditions.html
  - label: Selenium Python expected conditions
    url: https://www.selenium.dev/selenium/docs/api/py/selenium_webdriver_support/selenium.webdriver.support.expected_conditions.html
  - label: Selenium Python polling and ignored exceptions
    url: https://www.selenium.dev/selenium/docs/api/py/selenium_webdriver_support/selenium.webdriver.support.wait.html
examples:
  - title: Wait for the exact order result instead of the table
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import java.time.Duration;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.ui.ExpectedConditions;
          import org.openqa.selenium.support.ui.FluentWait;

          class OrderStatusTest {
            @Test
            void waitsForTheFilteredOrder() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/orders");
                driver.findElement(By.id("order-id")).sendKeys("A104");
                driver.findElement(By.id("filter-orders")).click();
                new FluentWait<>(driver)
                    .withTimeout(Duration.ofSeconds(5))
                    .pollingEvery(Duration.ofMillis(200))
                    .until(ExpectedConditions.textToBe(
                        By.id("filter-result"), "Showing order A104"));
              } finally {
                driver.quit();
              }
            }
          }
      - lang: python
        label: Selenium and pytest (Python)
        code: |
          from selenium import webdriver
          from selenium.common.exceptions import StaleElementReferenceException
          from selenium.webdriver.common.by import By
          from selenium.webdriver.support import expected_conditions as EC
          from selenium.webdriver.support.wait import WebDriverWait

          def test_waits_for_order():
              with webdriver.Chrome() as driver:
                  driver.get("http://localhost:3000/orders")
                  driver.find_element(By.ID, "order-id").send_keys("A104")
                  driver.find_element(By.ID, "filter-orders").click()
                  locate_result = EC.visibility_of_element_located((By.ID, "filter-result"))

                  def shows_requested_order(browser):
                      result = locate_result(browser)
                      return bool(result and result.text == "Showing order A104")

                  wait = WebDriverWait(
                      driver, 5, poll_frequency=0.2, ignored_exceptions=(StaleElementReferenceException,)
                  )
                  wait.until(shows_requested_order)
---

An implicit wait applies to element searches for the session. An explicit wait polls a condition until it's true or the timeout expires. A lookup inside that condition can itself use the implicit wait, so a poll can take longer than expected and the apparent timeout can be surprising. I avoid mixing them; where the suite uses explicit waits I leave the implicit wait at zero.

I choose a condition that describes why the next step is valid. Presence alone is weak if the element is still hidden, and finding a container may tell me nothing about whether its data finished loading. If the condition times out, I want the report to name the state I expected.

### Example

The local orders page already has a table before I filter it, so its presence tells me very little. I enter A104 and wait for the exact result `Showing order A104`. A substring match could pass on A1045.
