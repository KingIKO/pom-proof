---
title: A Selenium test opens the wrong shipment. How would you choose a better locator?
topic: selenium
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Locate the shipment by a stable attribute, then scope the action to that row.
looksFor:
  - Names Selenium's traditional By strategies.
  - Prefers stable IDs and dedicated test attributes.
  - Explains when XPath or a relative locator earns its use.
  - Avoids text and position when they are likely to change.
trap: Clicking the third row's link and assuming the fixture order won't change.
followUps:
  - question: When would a relative locator be a good fit?
    answer: When the spatial relationship is part of the interface and identifies one target across the supported layouts. I'd avoid it when responsive layouts change that relationship.
sources:
  - label: Selenium traditional and relative locators
    url: https://www.selenium.dev/documentation/webdriver/elements/locators/
  - label: Selenium locator guidance
    url: https://www.selenium.dev/documentation/test_practices/encouraged/locators/
  - label: Selenium scoped finders
    url: https://www.selenium.dev/documentation/webdriver/elements/finders/
  - label: Selenium element interactions
    url: https://www.selenium.dev/documentation/webdriver/elements/interactions/
examples:
  - title: Open shipment S218 without depending on row order
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;

          class ShipmentTest {
            @Test
            void opensTheRequestedShipment() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/shipments");
                var row = driver.findElement(By.cssSelector("[data-shipment='S218']"));
                row.findElement(By.cssSelector("[data-testid='shipment-detail']")).click();
                assertEquals("Shipment S218", driver.findElement(By.tagName("h1")).getText());
              } finally {
                driver.quit();
              }
            }
          }
      - lang: python
        label: Selenium and pytest (Python)
        code: |
          from selenium import webdriver
          from selenium.webdriver.common.by import By

          def test_opens_requested_shipment():
              with webdriver.Chrome() as driver:
                  driver.get("http://localhost:3000/shipments")
                  driver.find_element(
                      By.CSS_SELECTOR, "[data-shipment='S218'] [data-testid='shipment-detail']"
                  ).click()
                  assert driver.find_element(By.TAG_NAME, "h1").text == "Shipment S218"
---

I'd start with a unique stable ID or a dedicated test attribute, then use short CSS scoped to the part of the page I care about. Selenium's traditional strategies include ID, name, class name, tag name, CSS, XPath, link text, and partial link text. I'd choose XPath for a useful text or ancestor relationship I can't express clearly with the available attributes.

Link text depends on the words staying the same, and a positional path can target a different row when the list is sorted. A relative locator can express a spatial relationship, though I'd check it at the supported viewport sizes.

### Example

The sample shipments page includes S218 among several rows. The test finds that row by a data attribute, clicks its detail control, and expects the heading `Shipment S218`.
