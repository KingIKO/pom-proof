---
title: What does WebDriver BiDi add to a Selenium test?
topic: selenium
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: BiDi lets a test subscribe to browser events such as console messages where its browser and binding support them.
looksFor:
  - Classic WebDriver request and response versus event subscriptions
  - A narrow reason to observe an event
  - A browser and binding compatibility check
  - A distinction between diagnostics and user-facing behavior
trap: Promising the same BiDi feature set across browsers or replacing outcome assertions with low-level events.
followUps:
  - question: Would you migrate all existing tests to BiDi?
    answer: I'd add an event subscription where it solves a specific observation problem and leave ordinary WebDriver interactions in place.
sources:
  - label: Selenium WebDriver BiDi
    url: https://www.selenium.dev/documentation/webdriver/bidi/
  - label: Selenium BiDi logging
    url: https://www.selenium.dev/documentation/webdriver/bidi/logging/
  - label: Selenium W3C BiDi log subscriptions
    url: https://www.selenium.dev/documentation/webdriver/bidi/w3c/log/
  - label: Selenium Java LogInspector
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/bidi/module/LogInspector.html
examples:
  - title: Capture a missing preview image event
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import java.util.concurrent.CompletableFuture;
          import java.util.concurrent.TimeUnit;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.bidi.log.ConsoleLogEntry;
          import org.openqa.selenium.bidi.module.LogInspector;
          import org.openqa.selenium.firefox.FirefoxDriver;
          import org.openqa.selenium.firefox.FirefoxOptions;

          class ReportPreviewLogTest {
            @Test
            void reportsMissingImageAndShowsHeading() throws Exception {
              var options = new FirefoxOptions();
              options.setCapability("webSocketUrl", true);
              var driver = new FirefoxDriver(options);
              try (var logs = new LogInspector(driver)) {
                var event = new CompletableFuture<ConsoleLogEntry>();
                logs.onConsoleEntry(entry -> {
                  if ("Preview image unavailable".equals(entry.getText())) event.complete(entry);
                });
                driver.get("http://localhost:3000/reports/R42?preview=missing-image");
                assertEquals("Report R42", driver.findElement(By.tagName("h1")).getText());
                assertEquals("Preview image unavailable", event.get(5, TimeUnit.SECONDS).getText());
              } finally {
                driver.quit();
              }
            }
          }
---

Classic WebDriver interactions follow a request and response pattern. WebDriver BiDi adds bidirectional communication so my test can subscribe to things the browser reports, such as console events. The session has to request BiDi support. I attach the listener before opening the report page so I can keep the events if it fails to render.

I'd check the browser versions and the Selenium language binding before building a required check around a particular event. Support for one event doesn't establish support for every other command or event. I use Selenium's standard interactions for most tests and add BiDi when the information is useful and the support is verified.

### Example

For a report preview that sometimes renders blank, I'd capture browser error events where supported and still assert that the preview shows the expected report heading. The events explain a failure; the heading is the customer outcome.

The local fixture simulates a missing optional image. It logs `Preview image unavailable` and still shows the heading `Report R42`. The listener is attached before navigation so the event can be observed.
