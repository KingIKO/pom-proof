---
title: A Selenium page object caches a button that gets re-rendered. What would you change?
topic: selenium
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Locate the current element when acting on it and avoid caching references to replaceable nodes.
looksFor:
  - Explains PageFactory's lazy Java proxies.
  - Distinguishes repeated lookup from cached references.
  - Accounts for a node replaced by a render.
  - Avoids an unnecessary suite rewrite.
trap: Adding CacheLookup across a page so repeated interactions appear to run faster.
followUps:
  - question: Refresh replaces only the receipt status node. Which field would you change first?
    answer: I'd remove CacheLookup from the status field and rerun the Pending-to-Paid check. The other page objects can stay as they are until a specific lookup causes trouble.
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

PageFactory sets up lazy proxies for fields in a Java page object. By default a proxy looks up the matching element whenever a method on it is called. With `@CacheLookup`, the reference can outlive the original node. If the browser replaces that node, the next interaction with the cached reference can fail as stale.

For new code I prefer plain locator fields and an explicit lookup or wait inside an intent-named method, because a teammate can see when it resolves. In an existing suite I'd remove a bad cache where it causes failures. The rest can change when there's a practical reason.

### Example

The local receipt page starts at Pending and synchronously replaces its status node with Paid when refreshed. The uncached proxy reads both values from the correct node.
