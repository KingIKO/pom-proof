---
title: Selenium says the click was intercepted. What happened between your test and the browser?
topic: selenium
roles: [automation, sdet]
level: mid
type: concept
oneLine: I'd follow the W3C WebDriver command from the Selenium library to the browser-specific driver. I'd check where the error came from.
looksFor:
  - Follow the WebDriver command from the HTTP request to the reply.
  - Tell a browser error apart from a session that won't start or a connection that's broken.
  - Explain how Selenium Manager finds a driver for the browser version.
  - Explain what protocol Playwright uses for its documented remote connection.
trap: Assuming every click reached its element just because the browser session started.
followUps:
  - question: The checkout test already has a Grid session. Where does Grid send the Submit click?
    answer: Grid sends the command to the node running that session's browser. I'd look there for the error because the click doesn't start a new session.
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

I'd start at the binding, the Selenium library for my language. It sends an HTTP request to click an element in an existing session under the W3C WebDriver standard. A browser-specific driver controls a particular browser. For example, ChromeDriver tries the command in Chrome. It sends back success or an error the binding can report.

For a session to start reliably, the browser and driver versions need to work together. If I don't supply a driver, Selenium Manager can find the browser version and pick a matching driver. In Playwright, I'd use the documented `browserType.connect` method for a remote connection. It uses Playwright's own protocol, the rules for exchanging commands and replies.

### Example

If a checkout overlay covers Submit, the click command can return an intercepted error. That tells me the driver got the command and found something covering the target. I'd inspect the overlay before looking at the driver installation.
