---
title: How would you use Selenium for a report preview with a dropdown, an iframe, and a confirmation alert?
topic: selenium
roles: [automation, sdet]
level: junior
type: tooling
oneLine: I'd check what kind of dropdown the page uses. I'd switch WebDriver to a frame or window only when I need to work inside it.
looksFor:
  - Use `Select` only for the browser's built-in select element.
  - Switch into the embedded frame to use its controls and back out to check the main page.
  - Handle the browser alert and return to the original window after using a new tab.
  - Say how Playwright finds controls and waits for alerts or tabs.
trap: Using `Select` on a custom menu or looking for a frame's button in the main page.
followUps:
  - question: How would you return to the original window if the preview opens in a new tab?
    answer: I'd save the original window handle, its unique ID. I'd wait for a new handle and switch to it. When I'm done, I'd close the new tab and switch back.
  - question: In Playwright, when and where would you start listening for the Publish confirmation?
    answer: I'd start listening on the page before clicking Publish inside the frame. If Monthly still uses a built-in select, I'd choose it with `selectOption`. I'd use a frame locator to find Publish inside the frame. If the preview opens a tab, I'd wait for that separately.
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

I'd inspect the dropdown first. Selenium's `Select` helper works with the browser's native select element. If the app built a custom dropdown, I'd open its menu and choose an option using ordinary clicks. An iframe embeds a separate page inside the main page. I'd switch WebDriver, Selenium's browser control interface, into the iframe before looking for its confirmation control.

I'd switch back to the main page to check the result.

A browser alert has its own controls. I'd wait for the alert and check its message. I'd accept or dismiss it as the test requires. If a new window or tab opens, I'd switch to its handle, the ID WebDriver uses for it. I'd switch back to the original when done.

### Example

I'd choose Monthly on the local reports page to load the embedded preview. I'd click Publish inside the frame and accept the browser's confirmation. I'd wait for the page outside the frame to report that the monthly report was published.
