---
problem: locator/print-package-label
---

## What is going on

The dispatch table can print a shipping label or a packing slip for a package. Both buttons may have the same caption. The test needs the label for `PK-241`. Finding the correct row still leaves a choice about which document to print, so the selector needs to identify both the package and the action. Think of the package ID and the print action as the two inputs to the dispatch command.

## The fix

```css
tr[data-package-id="PK-241"] button[data-action="print-label"]
```

1. Scope to the row with `data-package-id="PK-241"`.

   **Why:** In `express-package-prepended`, `PK-402` appears above the target and has its own label action. The app's package ID keeps the search tied to `PK-241`, even when dispatch priority changes the table order.

2. Find the descendant button with `data-action="print-label"` inside the row.

   **Why:** In `address-added-and-actions-wrapped`, the packing slip and label both say `Imprimer`, but the app gives them different action codes. The descendant selector follows the label button into its wrapper and lets its column position change.

In Selenium Python, pass the same selector to `driver.find_element(By.CSS_SELECTOR, 'tr[data-package-id="PK-241"] button[data-action="print-label"]')`.

## Why the tempting answer fails

The decoy finds the first button in the second data cell of the first row. That position prints the right label on the original screen. In `express-package-prepended`, the same position would print for `PK-402`. In `address-added-and-actions-wrapped`, the position still belongs to `PK-241`, but it prints its packing slip. Opening a print view could look like success in either case.

## What the interviewer listens for

Explain how the package ID and action code are separate parts of the app's dispatch behavior. To catch both wrong-row and wrong-document mistakes, check the resulting payload or print preview for the `PK-241` shipping label barcode.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
