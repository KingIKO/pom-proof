---
title: A failed pickup confirmation loses its browser before triage. Where should the evidence be captured?
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Use hooks for browser setup and cleanup, and attach the screenshot before quitting on a failed scenario.
looksFor:
  - Distinguishes scenario hooks from hooks around individual steps.
  - Uses the scenario status to decide whether to attach evidence.
  - Captures failure evidence before closing the browser.
  - Leaves business setup visible in Gherkin.
trap: Closing the browser before taking the screenshot or letting a screenshot failure skip cleanup.
followUps:
  - question: Would you put the shopper's existing order in a Before hook?
    answer: I'd keep it in a Given because it explains why the shopper can view a pickup confirmation.
sources:
  - label: Cucumber scenario hooks and step hooks
    url: https://cucumber.io/docs/cucumber/api/#hooks
  - label: Cucumber-JVM Scenario status and attachments
    url: https://github.com/cucumber/cucumber-jvm/blob/v7.20.1/cucumber-java/src/main/java/io/cucumber/java/Scenario.java
  - label: Selenium screenshots
    url: https://www.selenium.dev/documentation/webdriver/interactions/windows/#takescreenshot
  - label: Selenium WebDriver setup and cleanup
    url: https://www.selenium.dev/documentation/webdriver/drivers/
  - label: Selenium element text and tag name lookups
    url: https://www.selenium.dev/documentation/webdriver/elements/information/
  - label: JUnit 5 Assertions
    url: https://docs.junit.org/5.14.5/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
examples:
  - title: A pickup confirmation the browser can check
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Pickup order confirmation
            @browser
            Scenario: A shopper sees an existing pickup order
              Given the shopper has fixture pickup order 42
              When the shopper opens its confirmation
              Then the confirmation heading is "Ready for pickup"
  - title: Attach a screenshot before closing the session
    variants:
      - lang: java
        label: Cucumber-JVM (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import io.cucumber.java.After;
          import io.cucumber.java.Before;
          import io.cucumber.java.Scenario;
          import io.cucumber.java.en.Given;
          import io.cucumber.java.en.Then;
          import io.cucumber.java.en.When;
          import org.openqa.selenium.By;
          import org.openqa.selenium.OutputType;
          import org.openqa.selenium.chrome.ChromeDriver;

          public class PickupSteps {
            private ChromeDriver browser;
            private int orderId;

            @Before("@browser")
            public void openBrowser() {
              browser = new ChromeDriver();
            }

            @Given("the shopper has fixture pickup order {int}")
            public void selectFixture(int id) {
              orderId = id;
            }

            @When("the shopper opens its confirmation")
            public void openConfirmation() {
              browser.get("http://localhost:3000/test-orders/" + orderId);
            }

            @Then("the confirmation heading is {string}")
            public void checkHeading(String heading) {
              assertEquals(heading, browser.findElement(By.tagName("h1")).getText());
            }

            @After("@browser")
            public void finish(Scenario scenario) {
              if (browser == null) {
                return;
              }
              try {
                if (scenario.isFailed()) {
                  byte[] png = browser.getScreenshotAs(OutputType.BYTES);
                  scenario.attach(png, "image/png", "Pickup confirmation at failure");
                }
              } finally {
                browser.quit();
              }
            }
          }
---

I'd start a browser in a Before hook and tear it down in an After hook. Those are scenario
hooks; step hooks run around individual steps and would be a poor fit for one screenshot per
failed scenario. The fact that a shopper already has an order belongs in the scenario.

In the After hook I'd check the scenario's status. If it failed and the browser started, I'd
attach a screenshot before quitting. I'd put cleanup in `finally` so it still happens if
capture fails.

### Example

The local test app serves synthetic order 42 and renders the confirmation heading in its
initial HTML. The tagged scenario starts one Chrome session. If the heading assertion fails,
the report gets a screenshot and the session still closes.
