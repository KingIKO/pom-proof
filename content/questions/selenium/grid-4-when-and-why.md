---
title: What does Selenium Grid 4 do, and when is it worth running?
topic: selenium
roles: [automation, sdet, senior]
level: mid
type: tooling
oneLine: I'd use Grid to match requests to browsers that can run them. My test runner still decides how many requests to send.
looksFor:
  - Show how a test uses remote WebDriver to request a browser with specific settings.
  - Explain what Grid schedules and what the test runner starts together.
  - Name the browser coverage or capacity the tests actually need.
  - Measure wait time and name who owns the setup and investigates failures.
trap: Adding Grid slots when the suite can't run tests together because they share one account.
followUps:
  - question: One quick Chrome test starts right away, but a batch waits minutes for browsers. What would you measure?
    answer: I'd compare how fast the runner asks for sessions with the number of free Chrome slots. I'd measure how long running sessions occupy them. I'd check if any job asks for Chrome settings the available nodes don't support.
  - question: Only the internal network can reach the app, and CI needs a specific Chrome image. How would you choose where to run Grid?
    answer: I'd check whether a provider can reach the app and run that image. If controlling both makes it better to run Grid myself, I'd plan for capacity and maintenance. Containers can help me run the same node image each time. I'd still measure slot use and keep node logs.
sources:
  - label: Selenium Grid overview
    url: https://www.selenium.dev/documentation/grid/
  - label: Selenium Grid components
    url: https://www.selenium.dev/documentation/grid/components/
  - label: Selenium Grid deployment modes
    url: https://www.selenium.dev/documentation/grid/getting_started/
  - label: Selenium remote WebDriver
    url: https://www.selenium.dev/documentation/webdriver/drivers/remote_webdriver/
  - label: Data URL encoding
    url: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
examples:
  - title: Ask a local Grid for a browser session
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.net.URI;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.chrome.ChromeOptions;
          import org.openqa.selenium.remote.RemoteWebDriver;

          class GridSmokeTest {
            @Test
            void chromeSlotCanNavigate() throws Exception {
              var endpoint = URI.create("http://localhost:4444").toURL();
              var driver = new RemoteWebDriver(endpoint, new ChromeOptions());
              try {
                driver.get("data:text/html,%3Ctitle%3EGrid%20smoke%3C%2Ftitle%3E");
                assertEquals("Grid smoke", driver.getTitle());
              } finally {
                driver.quit();
              }
            }
          }
      - lang: python
        label: Selenium and pytest (Python)
        code: |
          from selenium import webdriver

          def test_chrome_grid_slot():
              with webdriver.Remote(
                  command_executor="http://localhost:4444",
                  options=webdriver.ChromeOptions(),
              ) as driver:
                  driver.get("data:text/html,%3Ctitle%3EGrid%20smoke%3C%2Ftitle%3E")
                  assert driver.title == "Grid smoke"
---

If I need several supported browsers or more capacity than one machine offers, I'd use Grid. My test uses remote WebDriver, the interface for controlling a browser on another machine, to request a browser. Grid 4 picks a compatible slot, a place to run a browser session, on a node that hosts browsers. My test runner decides which tests start together and how many sessions to request.

I'd start with the smallest Grid that meets my needs. I'd measure time waiting for a slot separately from time running tests. If tests share data or mostly wait on a slow service, adding slots won't fix the cause. I'd make sure someone owns the browser images, available slots, and logs.

The Router accepts requests. The New Session Queue holds requests for new sessions. The Distributor assigns them to Nodes. The Session Map records each existing session's Node. The Event Bus carries messages between parts of Grid.

If I choose Standalone, all parts run together. Hub and Node keeps the browsers separate from the hub. Distributed runs the parts separately.

### Example

With one local Grid Chrome slot, I'd request a session. I'd check that the remote browser can load a small page. Then I'd compare startup and completion times across the browsers and settings I actually need to test.
