---
title: What does Selenium Grid 4 do, and when is it worth running?
topic: selenium
roles: [automation, sdet, senior]
level: mid
type: tooling
oneLine: Grid routes remote browser sessions to compatible slots; the test runner still decides how much work to send.
looksFor:
  - A remote WebDriver session and requested browser capabilities
  - Distinction between Grid scheduling and test-runner concurrency
  - A real cross-browser or capacity need
  - Queue time, infrastructure ownership, and diagnosis
trap: Installing a larger Grid to fix a suite that holds one shared account and cannot run concurrently.
followUps:
  - question: The single Chrome smoke test starts promptly, but a batch of Chrome jobs waits minutes for sessions. What would you measure?
    answer: I'd compare the runner's request rate with the free Chrome slots and how long current sessions hold them. I'd check whether any jobs requested a browser configuration the available nodes can't serve.
  - question: The app is reachable only on an internal network and CI needs a pinned Chrome image. What would drive the hosting decision?
    answer: I'd check whether a provider can reach the app and run that image. If control of both makes self-hosting the better choice, I'd budget for capacity and maintenance. Containers can make node images repeatable, but I'd still measure slot usage and keep node logs.
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

I'd use Grid when I need remote browser sessions for a real support matrix or more capacity than a single machine can provide. A test asks for a browser through remote WebDriver. Grid 4 manages new session requests and selects a compatible slot on a node. My runner still decides which tests start together and how many sessions to request.

I'd start with the smallest deployment that meets the need and measure queue time and run time separately. If tests share state or are mostly waiting on a slow service, more Grid slots won't fix the cause. Someone also has to own browser images, capacity, and logs.

The Router accepts requests. The New Session Queue holds new ones, the Distributor assigns them to Nodes, and the Session Map connects existing sessions to their Nodes. The Event Bus carries messages between components. Standalone runs everything together. Hub and Node separates the browsers from the hub. Distributed runs the components separately.

### Example

With a local Grid and a Chrome slot, I'd start by requesting a session and checking that the remote browser can load a tiny page. Then I'd compare startup and completion times in the real matrix.
