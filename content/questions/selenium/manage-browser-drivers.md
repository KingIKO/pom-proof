---
title: How do you manage browser drivers for Selenium in local and CI runs?
topic: selenium
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Use Selenium Manager where automatic resolution fits, and make browser and driver versions reproducible in CI.
looksFor:
  - Selenium Manager as the built-in fallback when no driver is supplied
  - Awareness of browser and driver compatibility
  - A plan for restricted CI networks
  - Startup evidence that distinguishes driver issues from test failures
trap: Keeping an untracked driver binary on each laptop and having no record of what version the CI job used.
followUps:
  - question: What if CI cannot reach driver download sites?
    answer: I'd use an approved image or cache with the matching browser and driver, and verify session startup in that environment.
sources:
  - label: Selenium Manager
    url: https://www.selenium.dev/documentation/selenium_manager/
  - label: Selenium Chrome sessions
    url: https://www.selenium.dev/documentation/webdriver/browsers/chrome/
  - label: Selenium Java capabilities
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/Capabilities.html
  - label: Selenium Python session capabilities
    url: https://www.selenium.dev/selenium/docs/api/py/selenium_webdriver_remote/selenium.webdriver.remote.webdriver.html
  - label: ChromeDriver returned capabilities
    url: https://developer.chrome.com/docs/chromedriver/capabilities?hl=en#returned_capabilities
  - label: Data URL encoding
    url: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
examples:
  - title: Report the versions used by a clean Chrome session
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.util.Map;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.chrome.ChromeDriver;

          class ChromeStartupTest {
            @Test
            void startsChromeAndLoadsAProbePage() {
              var driver = new ChromeDriver();
              try {
                var caps = driver.getCapabilities();
                var chrome = (Map<?, ?>) caps.getCapability("chrome");
                System.out.printf("Chrome %s, driver %s%n",
                    caps.getBrowserVersion(), chrome.get("chromedriverVersion"));
                driver.get("data:text/html,%3Ctitle%3EDriver%20smoke%3C%2Ftitle%3E");
                assertEquals("Driver smoke", driver.getTitle());
              } finally {
                driver.quit();
              }
            }
          }
      - lang: python
        label: Selenium and pytest (Python)
        code: |
          from selenium import webdriver

          def test_chrome_starts():
              with webdriver.Chrome() as driver:
                  caps = driver.capabilities
                  browser = caps["browserVersion"]
                  version = caps["chrome"]["chromedriverVersion"]
                  print(f"Chrome {browser}, driver {version}")
                  driver.get("data:text/html,%3Ctitle%3EDriver%20smoke%3C%2Ftitle%3E")
                  assert driver.title == "Driver smoke"
---

I'd let Selenium Manager resolve the driver on an ordinary development machine when the binding has no driver supplied. It can discover a compatible driver and download and cache it when needed. I'd check what the job actually ran rather than assume an automatic setup means every machine got the same pair.

On CI I prefer a repeatable browser and driver combination. In a restricted environment I can use an approved image with a matched pair instead of depending on a download at job startup. I record versions when the session starts, so someone looking at a failed job knows whether it even reached the application.

### Example

If a Chrome session refuses to start after an image update, I'd compare the browser and driver versions with the last good job and try opening a session before rerunning the whole suite.

The check starts Chrome without a hard-coded driver path, prints the returned browser and driver versions, and expects a local data page to load with the title `Driver smoke`.
