---
problem: locator/edit-direct-permission-xpath
---

## What is going on

Morgan Ives can have direct access and also access inherited from a group. Each of these grants lists Morgan's name and has an `Edit` button. The grants sit in two tables, and each table shows how its grants were made. The test needs to edit the direct grant, even when the other table appears above it.

The fix uses XPath, a query language that finds elements by their tags, attributes, text, and position in the markup.

## The fix

```xpath
//table[@data-role-source='direct']//td[@data-field='name'][normalize-space(.)='Morgan Ives']/ancestor::tr[1]//button[normalize-space(.)='Edit']
```

1. Limit the search to the table with `data-role-source='direct'`.

   **Why:** In the `inherited-grant-first` layout, Morgan appears in both tables. So the name cannot identify the grant until you know how the grant was made.

2. Find the `data-field='name'` cell with the full normalized text `Morgan Ives`.

   **Why:** Normalized text is all the text inside an element, including nested elements, with extra spaces removed. In `action-column-moved-before-name`, Morgan's surname is inside a span. A deputy's row also has both `Morgan Ives Jr` and a note that mentions Morgan. Requiring the full normalized text in the name cell leaves out both of those.

3. Move up to the nearest row with `ancestor::tr[1]`.

   **Why:** An ancestor is any element that contains the current one. In `action-column-moved-before-name`, the button's cell comes before the name cell. The row contains both cells. So stepping up to the row works whether the button comes before or after the name.

4. Find the descendant button whose normalized text is `Edit`.

   **Why:** A descendant is any element nested inside another, at any depth. In `action-column-moved-before-name`, the button gets a wrapper, and its caption sits in a span. Searching all of the row's descendants handles the wrapper. Using the button's combined text handles the span.

In Selenium Python, use `driver.find_element(By.XPATH, selector)` with the same expression.

## Why the tempting answer fails

The tempting answer searches both tables. It takes the first `Edit` button in a row with a cell matching Morgan's name. In `inherited-grant-first`, it returns the inherited grant's button. The name match is still exact, so retrying the lookup would return the same wrong grant.

## What the interviewer listens for

An axis is the direction an XPath step searches, such as up to ancestors or down to descendants. Explain why `[1]` on the ancestor axis finds the nearest row that contains the cell you identified. A first match across tables depends on the order of the tables. That order has nothing to do with which grant it is.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
