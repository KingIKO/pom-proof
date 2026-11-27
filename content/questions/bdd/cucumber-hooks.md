---
title: "The browser closes before anyone can investigate a failed pickup confirmation. Where would you capture the evidence?"
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd open and close the browser in hooks. If a scenario fails, I'd attach a screenshot before closing it."
looksFor:
  - "Explain which hooks run around a scenario and which run around one step."
  - "Check the scenario result before deciding whether to attach a screenshot."
  - "Attach the screenshot before closing the browser."
  - "Keep the facts that explain the business rule visible in Gherkin."
trap: "Closing the browser too early or skipping cleanup because taking the screenshot failed."
followUps:
  - question: "Would you create the shopper's existing order in a Before hook?"
    answer: "I'd put the order in a Given step. That fact explains why the shopper can see a pickup confirmation."
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

I'd use a Before hook to open the browser and an After hook to close it. Hooks are code Cucumber runs at set points. Those two run around a scenario. I'd avoid step hooks here because they run around each step and I need one screenshot per failed scenario.

I'd keep the existing order in the scenario, where someone reading Gherkin, the scenario's written steps, can see it. In the After hook, I'd check whether the scenario failed and whether the browser opened. If both are true, I'd attach a screenshot before closing it. I'd close the browser in `finally`, the block that still runs if taking the screenshot fails.

### Example

I'd test fictional order 42 in the local app. The app puts the heading in the first HTML it sends. I start one Chrome session for the tagged scenario. If the heading check fails, I'd attach a screenshot to the report and still close the session.
