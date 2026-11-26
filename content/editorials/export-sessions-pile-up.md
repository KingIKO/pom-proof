---
problem: diagnosis/export-sessions-pile-up
---

Every test creates a ChromeDriver session and never quits it. The number of open sessions climbs between tests, along with memory use. The export service still responds at about the same speed when called; the recorded timeout is on a browser command. Together those observations put the focus on the runner.

Pair the per-test setup with `@AfterEach` teardown that calls `driver.quit()` when the driver was created. This ends the session and closes its windows, including the extra preview tab. A `quit()` placed at the bottom of the test might be skipped if an assertion throws. Closing only the current tab leaves another window open in this flow, and leaves the session active.

The tempting patch is a longer export timeout. It can move the failure further down the suite while leaving the same accumulating sessions.

In an interview, propose comparing active sessions, runner memory and browser-action latency for the same suite before and after teardown. A fast isolated rerun hints at a suite-level effect but cannot identify which resource was left behind.

[Selenium: quitting the browser](https://www.selenium.dev/documentation/webdriver/interactions/windows/#quitting-the-browser-at-the-end-of-a-session) · [JUnit: `AfterEach`](https://docs.junit.org/current/api/org.junit.jupiter.api/org/junit/jupiter/api/AfterEach.html)
