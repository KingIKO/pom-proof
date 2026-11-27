---
title: A Selenium page object keeps a reference to a button the page replaces. What would you change?
topic: selenium
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd find the current button when I need it. I wouldn't keep a reference to a button the page can replace.
looksFor:
  - Explain how PageFactory's Java proxies find elements only when a test uses them.
  - Explain the difference between looking up the element again and reusing a saved reference.
  - Show what happens when the browser replaces the element.
  - Fix the failing lookup without rewriting the whole suite.
trap: Adding `@CacheLookup` to every field to try to speed up repeated actions.
followUps:
  - question: Refresh replaces only the receipt status element. Which field would you change first?
    answer: I'd remove `@CacheLookup` from the status field and rerun the change from Pending to Paid. I'd leave the other page objects alone unless another lookup causes trouble.
sources:
  - label: Selenium PageFactory behavior
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/PageFactory.html
  - label: Selenium FindBy annotation
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/FindBy.html
  - label: Selenium CacheLookup annotation
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/CacheLookup.html
  - label: Selenium stale element errors
    url: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/
examples:
  - title: Read the receipt through an uncached proxy
    variants:
      - lang: java
        label: Selenium PageFactory (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.WebDriver;
          import org.openqa.selenium.WebElement;
          import org.openqa.selenium.chrome.ChromeDriver;
          import org.openqa.selenium.support.FindBy;
          import org.openqa.selenium.support.PageFactory;

          class ReceiptObjectTest {
            static class ReceiptPage {
              @FindBy(id = "receipt-status")
              private WebElement status;
              @FindBy(id = "refresh-receipt")
              private WebElement refresh;

              ReceiptPage(WebDriver driver) { PageFactory.initElements(driver, this); }
              String status() { return status.getText(); }
              void refresh() { refresh.click(); }
            }

            @Test
            void readsTheReplacementStatusNode() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/receipts/R42");
                var receipt = new ReceiptPage(driver);
                assertEquals("Pending", receipt.status());
                receipt.refresh();
                assertEquals("Paid", receipt.status());
              } finally {
                driver.quit();
              }
            }
          }
---

I use a Java page object to keep a page's controls and actions in one class. PageFactory sets up lazy proxies, which stand in for elements and wait until I use them to find a match. By default, a proxy finds the element each time I call a method on it. With `@CacheLookup`, it can keep a reference after the browser replaces the original element. If I use that reference again, Selenium can report it as stale, meaning it points to an element that no longer exists there.

For new code, I'd store plain locators, the rules Selenium uses to find elements. I'd look up or wait for the element inside a method named for what it does. A teammate can then see when the lookup runs. In an existing suite, I'd remove the saved reference where it causes failures. I'd leave the rest until there's a reason to change it.

### Example

I'd open a local receipt page that starts at Pending. When I refresh the status, the page replaces the element with Paid immediately. I'd check that the proxy finds the right element for each read when it doesn't save the reference.
