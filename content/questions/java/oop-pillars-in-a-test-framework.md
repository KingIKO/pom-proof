---
title: How would you keep receipt tests working after a page redesign changes the selectors?
topic: java
roles: [automation, sdet]
level: junior
type: concept
oneLine: Hide selectors in page objects, expose intent through interfaces, and share only behavior pages really have in common.
looksFor:
  - Explains encapsulation with private receipt locators.
  - Distinguishes an abstract contract from an inherited implementation.
  - Describes dynamic dispatch for overridden instance methods.
  - Explains which design choice makes the redesign cheaper to absorb.
trap: Exposing every locator to the tests or putting unrelated actions in one shared base page.
followUps:
  - question: Why accept WebDriver instead of ChromeDriver in the page constructor?
    answer: The page depends on browser operations in the WebDriver interface and can receive another implementation without changing its code.
sources:
  - label: Java 21 classes and overriding
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html
  - label: Java 21 access control
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html#jls-6.6
  - label: Selenium page object models
    url: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
  - label: Selenium WebDriver interface
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/WebDriver.html
  - label: JUnit 5 assertions
    url: https://docs.junit.org/5.14.5/writing-tests/assertions.html
examples:
  - title: Read a receipt through a page object
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.chrome.ChromeDriver;

          abstract class Page {
              private final WebDriver driver;

              Page(WebDriver driver) {
                  this.driver = driver;
              }

              protected String text(By locator) {
                  return driver.findElement(locator).getText();
              }

              abstract String heading();
          }

          final class ReceiptPage extends Page {
              private static final By TITLE = By.id("receipt-title");

              ReceiptPage(WebDriver driver) {
                  super(driver);
              }

              @Override
              String heading() {
                  return text(TITLE);
              }
          }

          class ReceiptTest {
              @Test
              void showsOrderConfirmation() {
                  WebDriver driver = new ChromeDriver();
                  try {
                      driver.get("data:text/html,<h1 id='receipt-title'>Order confirmed</h1>");
                      Page receipt = new ReceiptPage(driver);
                      assertEquals("Order confirmed", receipt.heading());
                  } finally {
                      driver.quit();
                  }
              }
          }
---

Encapsulation keeps the receipt locator private, so the test can ask for the heading without
knowing how the page finds it. That's the biggest upkeep win here: a selector change is
contained in one class.

Inheritance lets the receipt page reuse element reading from a small base page. Abstraction
gives the test operations such as `heading()` and gives the page a browser contract in
`WebDriver`. Polymorphism means Java calls the receipt page's override of `heading()` at
runtime, even when the variable is typed as `Page`. I'd keep the base page small so a change
to one screen doesn't force changes to the rest.

### Example

Chrome opens a local HTML receipt. The test asks a `Page` for its heading and expects
`Order confirmed`. Only `ReceiptPage` knows the heading's element ID.
