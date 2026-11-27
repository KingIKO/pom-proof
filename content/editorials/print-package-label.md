---
problem: locator/print-package-label
---

## What is going on

The dispatch table can print two documents for a package, a shipping label or a packing slip. Both buttons may have the same caption. The test needs the label for `PK-241`. Finding the right row still leaves a choice of document. So the selector needs to identify both the package and the action.

Think of the package ID and the print action as the two inputs to the dispatch command. The fix uses a CSS selector, a pattern that matches page elements. Square brackets make an attribute selector. For example, `[data-action="print-label"]` matches elements whose `data-action` attribute is `print-label`.

## The fix

```css
tr[data-package-id="PK-241"] button[data-action="print-label"]
```

1. Narrow the search to the row with `data-package-id="PK-241"`.

   **Why:** In `express-package-prepended`, `PK-402` appears above the target and has its own label action. The app's package ID keeps the search tied to `PK-241`. That still holds when dispatch priority changes the order of the table.

2. Find the descendant button with `data-action="print-label"` inside the row.

   **Why:** A descendant is any element inside another one, at any depth. In `address-added-and-actions-wrapped`, the packing slip and the label both say `Imprimer`. The app still gives them different action codes. The descendant selector reaches the label button inside its wrapper, and it lets the button's column change.

Selenium is another browser automation tool. In Selenium Python, pass the same selector to `driver.find_element(By.CSS_SELECTOR, 'tr[data-package-id="PK-241"] button[data-action="print-label"]')`.

## Why the tempting answer fails

The decoy finds the first button in the second data cell of the first row. On the original screen, that position prints the right label. In `express-package-prepended`, the same position would print for `PK-402`. In `address-added-and-actions-wrapped`, the position still belongs to `PK-241`, but it prints the packing slip. Opening a print view could look like success in either case.

## What the interviewer listens for

Explain that the package ID and the action code are separate parts of how the app dispatches. One check can catch both mistakes, the wrong row and the wrong document. To make that check, look for the `PK-241` shipping label barcode in the resulting payload or print preview. The payload is the data the app produces for the print job.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
