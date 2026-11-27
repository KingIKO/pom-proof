---
problem: locator/edit-direct-permission-xpath
---

## What is going on

Morgan Ives can have direct access and access inherited from a group. Both grants list Morgan's name and have an `Edit` button. They live in tables distinguished by how the grant was made. The test needs to edit the direct grant, even when the other table is rendered above it.

## The fix

```xpath
//table[@data-role-source='direct']//td[@data-field='name'][normalize-space(.)='Morgan Ives']/ancestor::tr[1]//button[normalize-space(.)='Edit']
```

1. Scope the search to the table with `data-role-source='direct'`.

   **Why:** In `inherited-grant-first`, Morgan appears in both tables, so the name cannot identify the grant until the source is known.

2. Find the `data-field='name'` cell with the full normalized text `Morgan Ives`.

   **Why:** In `action-column-moved-before-name`, Morgan's surname is inside a span, and a deputy's row has both `Morgan Ives Jr` and a note mentioning Morgan. Full normalized text in the named cell excludes both distractions.

3. Move up to the nearest row with `ancestor::tr[1]`.

   **Why:** In `action-column-moved-before-name`, the action is in a cell before the name. The row owns both cells, so stepping up to it works whether the action appears before or after the name.

4. Find the descendant button whose normalized text is `Edit`.

   **Why:** In `action-column-moved-before-name`, the button gains a wrapper and its caption sits in a span. Searching the row's descendants and using the combined element text handles both changes.

In Selenium Python, use `driver.find_element(By.XPATH, selector)` with the same expression.

## Why the tempting answer fails

The decoy takes the first `Edit` button whose row has a cell matching Morgan's name, across both tables. In `inherited-grant-first`, it returns the inherited grant's button. The exact name is still correct, so retrying the lookup would yield the same wrong grant.

## What the interviewer listens for

Explain why `[1]` on the ancestor axis finds the nearest row that owns an identified cell. A first match across tables depends on an ordering unrelated to the grant's identity.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
