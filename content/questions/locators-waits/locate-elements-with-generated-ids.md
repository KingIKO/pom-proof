---
title: The invoice drawer gives its reference field a new ID each time it loads. How would the test find the field?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I look for a stable name or attribute inside the correct drawer before I rely on part of a generated ID.
looksFor:
  - Use an accessible name or a dedicated test attribute.
  - Limit the selection to the right drawer.
  - Require a stable contract before using an ID prefix.
  - If the drawer exposes neither a usable label nor a stable name, ask for a stable hook on Purchase reference.
trap: Making the test use the first text field it finds just because the app assigned a new ID.
followUps:
  - question: If two fields share the documented first part of the ID, how would you choose between them?
    answer: I'd limit the match to the relevant section. Then I'd verify that the resulting selector identifies exactly one control.
sources:
  - label: Playwright locator recommendations and scoping
    url: https://playwright.dev/docs/locators
  - label: Playwright Python locator recommendations
    url: https://playwright.dev/python/docs/locators
  - label: Selenium element locators
    url: https://www.selenium.dev/documentation/webdriver/elements/locators/
  - label: Selenium scoped finders
    url: https://www.selenium.dev/documentation/webdriver/elements/finders/
  - label: Selenium element interactions
    url: https://www.selenium.dev/documentation/webdriver/elements/interactions/
  - label: Selenium DOM property lookup
    url: https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/WebElement.html
examples:
  - title: Enter a reference without using the generated ID
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test('types in the invoice reference field', async ({ page }) => {
            await page.goto('http://localhost:3000/invoices/sample');
            const drawer = page.getByRole('dialog', { name: 'Edit invoice' });
            const reference = drawer.getByLabel('Purchase reference');
            await reference.fill('PO-440');
            await expect(reference).toHaveValue('PO-440');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          from playwright.sync_api import expect

          def test_invoice_reference(page):
              page.goto("http://localhost:3000/invoices/sample")
              drawer = page.get_by_role("dialog", name="Edit invoice")
              reference = drawer.get_by_label("Purchase reference")
              reference.fill("PO-440")
              expect(reference).to_have_value("PO-440")
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.openqa.selenium.By;
          import org.openqa.selenium.chrome.ChromeDriver;

          class InvoiceReferenceTest {
            @Test
            void locatesReferenceInTheDrawer() {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/invoices/sample");
                var drawer = driver.findElement(By.cssSelector("[data-testid='invoice-editor']"));
                var field = drawer.findElement(By.name("purchaseReference"));
                field.clear();
                field.sendKeys("PO-440");
                assertEquals("PO-440", field.getDomProperty("value"));
              } finally {
                driver.quit();
              }
            }
          }
---

I'd inspect how the field is named and where it sits on the page. A label can identify the same control a user looks for. So can a role with an accessible name, the name that assistive technology reads out. If there are two matches, I'd scope the search to the named invoice drawer. That means I'd search only inside the drawer.

In a legacy form, I might use a stable `name` attribute or a documented ID prefix. I'd do that only if it narrows the match to one element. If the entire ID changes, I'd avoid matching any part of it. If the interface still gives me no reliable handle, I'd ask the team for a dedicated test attribute.

### Example

The local invoice page opens an edit drawer. It assigns a new ID to the purchase-reference input. The test finds the field by its label or its stable name. It types `PO-440` into that field and checks the value.
