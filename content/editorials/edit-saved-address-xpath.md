---
problem: locator/edit-saved-address-xpath
---

## What is going on

The address table has a row for `Studio 14` and a row for `Studio 140`. Both rows have `Edit` buttons. The app can reorder the addresses or add a column. Each row's header cell names its address. The exercise also promises that the header stays before the cell with the buttons.

The fix uses XPath, a query language that finds elements by their tags, attributes, text, and position in the markup.

## The fix

```xpath
//th[normalize-space(.)='Studio 14']/following-sibling::td//button[normalize-space(.)='Edit']
```

1. Find the `th` header cell whose full normalized text is `Studio 14`.

   **Why:** Normalized text is all the text inside an element, including nested elements, with extra spaces removed. In the `recently-edited-address-first` layout, `Studio 140` moves ahead of `Studio 14`. That name contains the target text. An exact match is what keeps that row out when the order changes.

2. Search the header's following sibling `td` cells.

   **Why:** Siblings are elements with the same parent, here cells in the same row. In `region-column-added`, a new region cell pushes the buttons farther from the header. The cells after the header are still its siblings in the same row. So the XPath allows any number of cells in between without crossing into another address.

3. Find the descendant button with normalized text `Edit`.

   **Why:** In `region-column-added`, the buttons sit inside an extra `div`, and `Edit` is inside a span within the button. A descendant search looks at every element nested inside the cells, so it reaches the button through the wrapper. The normalized caption tells it apart from `Delete`.

In Selenium Python, pass the same XPath to `driver.find_element(By.XPATH, selector)`.

## Why the tempting answer fails

The tempting answer takes the first button in the second data cell of the first row. In the original table, that is the right button. In `recently-edited-address-first`, it opens `Studio 140`. In `region-column-added`, the second data cell holds a region name and no button. So the same shortcut finds nothing.

## What the interviewer listens for

An axis is the direction an XPath step searches, such as forward through siblings. Name the layout promise that makes the sibling axis useful here. The header comes before the cell with the buttons. If the buttons could move to either side, go up from the header to its row with `ancestor::tr[1]`. Then search back down from that row.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
