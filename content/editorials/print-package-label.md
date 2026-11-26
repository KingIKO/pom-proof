---
problem: locator/print-package-label
---

```css
tr[data-package-id="PK-241"] button[data-action="print-label"]
```

The package ID identifies the record. The action code identifies which document the button prints. Both are part of the example app's dispatch behavior, so selecting on those values remains meaningful when the table changes its labels or adds another type of Print button. A descendant selector allows a wrapper around the action.

The decoy locates the first button of the second data cell in the first row. In the original table it prints the right label. After an express package appears above `PK-241`, it could print a label for that package. In the localized layout it selects the packing slip for the right package. That is a different failure: the record is correct but the action is wrong.

In an interview, describe a check that catches both mistakes. For example, read the resulting print payload or preview and check that it has the `PK-241` label barcode. An assertion about opening a print view would miss generation of the other package's label and the packing slip.

In Selenium Python, the same CSS selector is passed to `driver.find_element(By.CSS_SELECTOR, 'tr[data-package-id="PK-241"] button[data-action="print-label"]')`.

Sources: [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors), [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
