---
title: How would you set up Selenium's browser drivers locally and on automated test jobs?
topic: selenium
roles: [automation, sdet]
level: junior
type: tooling
oneLine: I'd let Selenium Manager find a driver when automatic setup fits. In automated jobs, I'd make sure I can run with the same browser and driver versions again.
looksFor:
  - Explain that Selenium Manager can find a driver if you don't supply one.
  - Check that the browser version works with the driver version.
  - Plan for test jobs that can't reach download sites.
  - Log the versions at startup so you can tell launch problems from test failures.
trap: Keeping an untracked driver on each laptop and not recording the version the automated job used.
followUps:
  - question: How would you start Selenium if the automated test job can't reach driver download sites?
    answer: I'd use an approved image or cache that already has the matching browser and driver. I'd check that Selenium can start a session there.
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

A driver is the program Selenium talks to when it controls a browser. If I haven't supplied a driver to my Selenium library, I'd let the built-in Selenium Manager find one on a typical development machine. It can find a compatible driver and download and save it for reuse when needed. I'd check which versions actually ran because automatic setup can choose different pairs on different machines.

In CI, the system that runs automated jobs, I'd choose a browser and driver combination I can repeat. If the network is restricted, I'd use an approved image, a packaged environment with both versions installed. That avoids a download when the job starts. I'd record versions when the session starts so a reader can tell whether a failed job got as far as the app.

### Example

If Chrome won't start after an image update, I'd compare both versions with the last successful job. I'd try opening a session before running the whole suite again.

I'd start Chrome without setting a fixed driver path. I'd print the browser and driver versions the session reports. I'd open a local data page and expect the title `Driver smoke`.
