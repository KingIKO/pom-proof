---
title: How would you keep parallel checkout tests from taking over each other's browser?
topic: java
roles: [sdet]
level: senior
type: tooling
oneLine: Give each test its own driver, and clear any thread-local reference during teardown before the worker thread is reused.
looksFor:
  - Explains that ThreadLocal isolates values by thread rather than by test.
  - Creates and binds a new session in per-test setup.
  - Quits the session and removes the thread-local value even when cleanup fails.
  - Identifies hazards that remain in shared data, files, or async work.
trap: Calling quit without removing the ThreadLocal value and leaving a closed session on a reused worker thread.
followUps:
  - question: Would you fetch the same driver from a background thread?
    answer: No. That thread has a different ThreadLocal value. Keep browser work on the owning thread and pass only plain data to background tasks.
sources:
  - label: Java 21 ThreadLocal
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ThreadLocal.html
  - label: Selenium session isolation
    url: https://www.selenium.dev/documentation/test_practices/encouraged/avoid_sharing_state/
  - label: Selenium WebDriver lifecycle
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/WebDriver.html
  - label: JUnit 5 lifecycle annotations
    url: https://docs.junit.org/5.14.5/writing-tests/annotations.html
  - label: JUnit 5 parallel execution
    url: https://docs.junit.org/5.14.5/writing-tests/parallel-execution.html
examples:
  - title: Bind and clear the driver for each checkout test
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.AfterEach;
          import org.junit.jupiter.api.BeforeEach;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.chrome.ChromeDriver;

          class CheckoutBrowserTest {
              private static final ThreadLocal<WebDriver> BROWSER = new ThreadLocal<>();

              @BeforeEach
              void startBrowser() {
                  BROWSER.set(new ChromeDriver());
              }

              @AfterEach
              void stopBrowser() {
                  WebDriver driver = BROWSER.get();
                  try {
                      if (driver != null) driver.quit();
                  } finally {
                      BROWSER.remove();
                  }
              }

              @Test
              void showsReceiptTitle() {
                  WebDriver driver = BROWSER.get();
                  driver.get("data:text/html,<title>Order receipt</title>");
                  assertEquals("Order receipt", driver.getTitle());
              }
          }
---

One worker might run the coupon test and then the receipt test. Even if those tests never
overlap, a driver left in `ThreadLocal` can outlive the coupon test. The slot belongs to the
worker thread, so the next test could pick up a session that's already closed.

If page helpers need a shared way to look up the driver, I'd bind a fresh session in
`@BeforeEach`. In `@AfterEach` I'd quit it on the same thread and call `remove()` in `finally`
so a quit failure can't leave the slot occupied. I'd also give parallel tests separate
checkout records and download paths. Those can still collide even with separate browsers.

### Example

JUnit setup opens a Chrome session for the receipt test. The local fixture should have the
title `Order receipt`. Teardown quits that session and clears the binding.
