---
title: What does WebDriver BiDi add to a Selenium test?
topic: selenium
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: If the browser and Selenium library support the events I need, I'd use BiDi to receive them. Console messages are one example.
looksFor:
  - Explain how listening for events differs from sending a command and waiting for a reply.
  - Give a specific reason to listen for an event.
  - Check that the browser and Selenium language library support the event.
  - Use events to investigate failures and keep checks for what the user sees.
trap: Assuming all browsers support the same BiDi features or checking events instead of what the user sees.
followUps:
  - question: Would you migrate all existing tests to BiDi?
    answer: I'd add an event listener only where I need to observe something specific. I'd keep ordinary WebDriver actions in place.
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

With classic WebDriver, I send a request and wait for a reply. WebDriver BiDi lets messages go both ways. My test can subscribe to events, such as console messages the browser sends as they happen. I'd request BiDi support when I start the session. Before opening the report page, I'd attach a listener to collect events even if the page fails to load.

Before I require a specific event, I'd check support in the browser versions and the binding, the Selenium library for my language. If one event works, that doesn't tell me whether other events or commands work. I'd keep standard Selenium actions for most tests. I'd add BiDi where I know it's supported and the information helps.

### Example

If a report preview sometimes appears blank, I'd collect browser errors where the browser supports them. I'd still check that the preview shows the expected heading. I use the errors to explain a failure and the heading to check what the customer sees.

I'd use a local test page with an optional image missing. I'd attach the listener before opening the page so I can catch `Preview image unavailable`. I'd still expect to see the heading `Report R42`.
