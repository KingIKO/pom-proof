---
title: A report preview uses a dropdown, an iframe, and a confirmation alert. How would you drive it?
topic: selenium
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Identify the actual widget and change WebDriver's browsing context only where the interaction needs it.
looksFor:
  - Uses Select for native select elements only.
  - Switches into and out of the iframe explicitly.
  - Handles the alert and restores the right window after a new tab.
  - Knows Playwright's corresponding locator and event model.
trap: Applying Select to a custom menu or searching the top document for a button inside the frame.
followUps:
  - question: What if the preview opens a new tab?
    answer: I'd save the current handle, wait for a new one, switch to it, then close it and switch back to the original window.
  - question: You port Monthly publishing to Playwright. Where do you register the handler for the Publish confirmation?
    answer: I'd register it on the page before clicking Publish inside the frame. I'd use selectOption for the Monthly control if it remains a native select, a frame locator for Publish, and a separate popup wait if the preview opens another tab.
sources:
  - label: Selenium select lists
    url: https://www.selenium.dev/documentation/webdriver/support_features/select_lists/
  - label: Selenium alerts
    url: https://www.selenium.dev/documentation/webdriver/interactions/alerts/
  - label: Selenium frames
    url: https://www.selenium.dev/documentation/webdriver/interactions/frames/
  - label: Selenium windows and tabs
    url: https://www.selenium.dev/documentation/webdriver/interactions/windows/
  - label: Selenium Java expected conditions
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/ExpectedConditions.html
  - label: Selenium Python expected conditions
    url: https://www.selenium.dev/selenium/docs/api/py/selenium_webdriver_support/selenium.webdriver.support.expected_conditions.html
  - label: Playwright input actions
    url: https://playwright.dev/docs/input
  - label: Playwright frames
    url: https://playwright.dev/docs/frames
  - label: Playwright dialogs
    url: https://playwright.dev/docs/dialogs
  - label: Playwright pages and popups
    url: https://playwright.dev/docs/pages
examples:
  - title: Confirm a monthly report from its embedded preview
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.time.Duration;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.ui.ExpectedConditions;
          import org.openqa.selenium.support.ui.Select;
          import org.openqa.selenium.support.ui.WebDriverWait;

          class ReportPreviewTest {
            @Test
            void confirmsMonthlyReport() {
              var driver = new ChromeDriver();
              var wait = new WebDriverWait(driver, Duration.ofSeconds(5));
              try {
                driver.get("http://localhost:3000/reports/sample");
                new Select(driver.findElement(By.id("period"))).selectByVisibleText("Monthly");
                wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("preview")));
                driver.findElement(By.id("confirm-report")).click();
                var alert = wait.until(ExpectedConditions.alertIsPresent());
                assertEquals("Publish monthly report?", alert.getText());
                alert.accept();
                driver.switchTo().defaultContent();
                wait.until(ExpectedConditions.textToBePresentInElementLocated(
                    By.id("report-status"), "Monthly report published"));
              } finally {
                driver.quit();
              }
            }
          }
      - lang: python
        label: Selenium and pytest (Python)
        code: |
          from selenium import webdriver
          from selenium.webdriver.common.by import By
          from selenium.webdriver.support import expected_conditions as EC
          from selenium.webdriver.support.select import Select
          from selenium.webdriver.support.wait import WebDriverWait

          def test_confirms_monthly_report():
              with webdriver.Chrome() as driver:
                  wait = WebDriverWait(driver, 5)
                  driver.get("http://localhost:3000/reports/sample")
                  period = Select(driver.find_element(By.ID, "period"))
                  period.select_by_visible_text("Monthly")
                  wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, "preview")))
                  driver.find_element(By.ID, "confirm-report").click()
                  alert = wait.until(EC.alert_is_present())
                  assert alert.text == "Publish monthly report?"
                  alert.accept()
                  driver.switch_to.default_content()
                  assert wait.until(EC.text_to_be_present_in_element(
                      (By.ID, "report-status"), "Monthly report published"
                  ))
---

I inspect the dropdown first. Selenium's `Select` helper works with a native select element. A custom dropdown needs ordinary interactions with its trigger and options. I switch to the iframe before finding its confirmation control and back to the top document to check the result.

A browser alert has its own interface. I wait for it, check the prompt, and accept or dismiss it as the case requires. For a new window or tab, I switch to its handle and restore the original when finished.

### Example

The local reports page loads an embedded preview after selecting Monthly. I publish from the frame, accept the browser's confirmation, and wait for the outer page to report that the monthly report was published.
