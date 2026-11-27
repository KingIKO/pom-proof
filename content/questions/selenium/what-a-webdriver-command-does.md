---
title: Your Selenium click returns an intercepted error. What happened between the test and browser?
topic: selenium
roles: [automation, sdet]
level: mid
type: concept
oneLine: Follow the W3C command from the binding through the browser-specific driver and read the error at the right layer.
looksFor:
  - Traces the classic WebDriver command as an HTTP request and response.
  - Distinguishes browser behavior from session startup or transport failure.
  - Explains how Selenium Manager finds a compatible driver.
  - Contrasts Playwright's documented remote connection.
trap: Assuming a successful session startup means every click must have reached the target element.
followUps:
  - question: The checkout test is already running on Grid. Where does the Submit click go after it reaches Grid?
    answer: Grid routes that existing WebDriver session's command to the node running its browser. I'd look there for the intercepted-click error rather than diagnosing it as a new session request.
sources:
  - label: Selenium components
    url: https://www.selenium.dev/documentation/overview/components/
  - label: W3C WebDriver element click
    url: https://www.w3.org/TR/webdriver2/#element-click
  - label: Selenium Manager resolution
    url: https://www.selenium.dev/documentation/selenium_manager/
  - label: Selenium Grid router
    url: https://www.selenium.dev/documentation/grid/components/#router
  - label: Playwright remote browser connections
    url: https://playwright.dev/docs/api/class-browsertype#browser-type-connect
---

The binding sends an HTTP command for a particular element in an existing W3C WebDriver session. ChromeDriver is the browser-specific driver for Chrome. It handles the command against that browser and returns success or a protocol error that the binding can report.

Browser and driver versions need to be compatible for the session to start reliably. If the binding hasn't been supplied with a driver, Selenium Manager can discover the browser version and resolve an appropriate driver. Playwright's remote `browserType.connect` uses the Playwright protocol instead.

### Example

If a checkout overlay covers Submit, the element-click command can return an intercepted error. That tells me the driver received the command and found that the target was obscured. I'd inspect the overlay before investigating driver installation.
