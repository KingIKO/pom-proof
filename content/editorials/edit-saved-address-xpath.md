---
problem: locator/edit-saved-address-xpath
---

```xpath
//th[normalize-space(.)='Studio 14']/following-sibling::td//button[normalize-space(.)='Edit']
```

Start from the row header with the exact name `Studio 14`. The `following-sibling::td` step stays within the same row because the data cells and header share a parent. Search those cells' descendants for `Edit`. The button may have its own span or a surrounding action wrapper, and a new region column can sit before the controls.

The decoy takes the first button in the first row's second data cell. It would edit `Studio 140` after the list sorts by recent changes. With the region column added, the second data cell is just a region name, so the decoy matches nothing. A substring check for the header would be a separate mistake because `Studio 140` includes `Studio 14`.

In an interview, name the layout assumption that the reference still needs: the `th` comes before its action cell. If columns can move to either side of the name, step up to the containing row with `ancestor::tr[1]` and search back down. For this exercise, the sibling relation directly describes how the address grid is organized.

In Selenium Python, pass the same XPath to `driver.find_element(By.XPATH, selector)`.

Sources: [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes), [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
