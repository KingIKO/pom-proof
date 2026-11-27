---
problem: locator/edit-saved-address-xpath
---

## What is going on

The address grid has a row for `Studio 14` and a row for `Studio 140`. Both rows have `Edit` buttons, and the app can reorder the addresses or add a column. The row header names the address. The exercise also promises that the header stays before the action cell.

## The fix

```xpath
//th[normalize-space(.)='Studio 14']/following-sibling::td//button[normalize-space(.)='Edit']
```

1. Find the `th` whose full normalized text is `Studio 14`.

   **Why:** In `recently-edited-address-first`, `Studio 140` moves ahead of `Studio 14`. Its name contains the target text, so equality is what keeps that row out when the order changes.

2. Search the header's following sibling `td` cells.

   **Why:** In `region-column-added`, the new region cell pushes the actions farther from the header. The following cells are still siblings of the header within the same row, so the selector can allow any number of intervening cells without crossing into another address.

3. Find the descendant button with normalized text `Edit`.

   **Why:** In `region-column-added`, the actions sit inside an extra `div`, and `Edit` is inside a span within the button. A descendant search reaches the button through the wrapper, and the normalized caption separates it from `Delete`.

In Selenium Python, pass the same XPath to `driver.find_element(By.XPATH, selector)`.

## Why the tempting answer fails

The first button in the first row's second data cell is the intended action in the original grid. In `recently-edited-address-first`, it opens `Studio 140`. In `region-column-added`, the second data cell contains a region name and no button, so the same shortcut finds nothing.

## What the interviewer listens for

Name the layout promise that makes the sibling axis useful here: the header comes before the action cell. If actions could move to either side, go up to the containing row with `ancestor::tr[1]` and search back down.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
