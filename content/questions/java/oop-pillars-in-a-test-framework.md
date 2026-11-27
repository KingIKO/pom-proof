---
title: A redesign changes how the tests find elements on the receipt page. How would you keep the tests working?
topic: java
roles: [automation, sdet]
level: junior
type: concept
oneLine: I hide selectors in page objects and expose intent through interfaces. I share only the behavior that pages really have in common.
looksFor:
  - Explain encapsulation with private receipt locators.
  - Tell an abstract contract apart from an inherited implementation.
  - Describe dynamic dispatch, where Java picks an overridden instance method at runtime.
  - Explain which design choice makes the redesign cheaper to handle.
trap: Exposing every locator to the tests, or putting unrelated actions in one shared base page.
followUps:
  - question: Why accept `WebDriver` instead of `ChromeDriver` in the page constructor?
    answer: The page depends on browser operations in the `WebDriver` interface. So it can receive another implementation without changing its code.
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

A page object is a class that represents one screen for the tests. A locator tells Selenium how to find an element on that screen. Encapsulation means a class hides such details behind its methods.

Here, encapsulation keeps the receipt locator private. The test can ask for the heading without knowing how the page finds it. That's the biggest upkeep win here, because a selector change stays in one class.

Inheritance lets the receipt page reuse element reading from a small base page. Abstraction gives the test operations such as `heading()`. It also gives the page a browser contract in `WebDriver`, a set of operations the page can call.

Polymorphism means Java calls the receipt page's override of `heading()` at runtime. That happens even when the variable is typed as `Page`. I'd keep the base page small, so a change to one screen doesn't force changes to the rest.

### Example

Chrome opens a local HTML receipt. The test asks a `Page` for its heading and expects `Order confirmed`. Only `ReceiptPage` knows the heading's element ID.
