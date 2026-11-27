---
title: A Selenium test opens the wrong shipment. How would you choose a better locator?
topic: selenium
roles: [automation, sdet]
level: junior
type: tooling
oneLine: I'd find the shipment by an attribute that stays the same. I'd look for the control only inside that row.
looksFor:
  - Name Selenium's usual `By` strategies for finding elements.
  - Prefer IDs that stay the same or attributes the app sets aside for tests.
  - Explain when XPath or a locator based on position relative to another element helps.
  - Avoid using text or row order if it may change.
trap: Clicking the link on the third row and assuming the test data will always appear in that order.
followUps:
  - question: When would a relative locator be a good fit?
    answer: I'd use a relative locator if the position is part of the design and the same rule picks one target across supported layouts. If the layout changes that relationship, I'd choose another locator.
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

I'd start with a locator, which tells Selenium how to find a page element. I'd use a unique ID that stays the same or an attribute the app sets aside for tests. I'd use a short CSS selector, a rule for matching elements, inside the part of the page I need.

Selenium's `By` strategies include ID, name, class name, tag name, CSS, XPath, link text, and partial link text. XPath describes where to look in a page's element tree. If the available attributes can't express a match clearly, I'd use XPath to match text or an element that contains another.

If I match link text, the words need to stay the same. If I match by row position, sorting can send me to a different shipment. I can use a relative locator to match an element by where it sits next to another. I'd check it at every supported browser window size.

### Example

I'd use S218 from a sample page with several shipments. I'd find its row by its data attribute and click the details control inside it. I'd expect the heading `Shipment S218`.
