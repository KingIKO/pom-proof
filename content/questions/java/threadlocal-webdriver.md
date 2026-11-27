---
title: How would you keep checkout tests from sharing one browser session when they run at the same time?
topic: java
roles: [sdet]
level: senior
type: tooling
oneLine: I give each test its own driver. During teardown, I clear any thread-local reference before the worker thread is reused.
looksFor:
  - Explain that `ThreadLocal` keeps a separate value for each thread, not for each test.
  - Create and bind a new session in the setup for each test.
  - Quit the session and remove the thread-local value, even when cleanup fails.
  - Name the risks that remain in shared data, files, or async work.
trap: Calling quit without removing the `ThreadLocal` value. That leaves a closed session on a reused worker thread.
followUps:
  - question: If a task runs on a background thread, would you have it get the same browser driver?
    answer: No. That thread has a different `ThreadLocal` value. I'd keep browser work on the thread that owns the driver. I'd pass only plain data to background tasks.
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

A `ThreadLocal` is a Java holder that keeps a separate value, or slot, for each thread. A worker thread is a thread that the test runner can reuse for more than one test. One worker might run the coupon test and then the receipt test. Even if those tests never overlap, a driver left in `ThreadLocal` can outlive the coupon test.

The slot belongs to the worker thread, not to the test. So the next test could pick up a session that's already closed.

If page helpers need a shared way to look up the driver, I'd bind a fresh session in `@BeforeEach`. JUnit runs that setup method before each test. In `@AfterEach`, the teardown method, I'd quit the session on the same thread. I'd call `remove()` in `finally`, so a quit failure can't leave the slot occupied.

I'd also give parallel tests separate checkout records and download paths. Those can still collide, even when each test has its own browser.

### Example

JUnit setup opens a Chrome session for the receipt test. The local fixture should have the title `Order receipt`. Teardown quits that session and clears the thread-local binding.
