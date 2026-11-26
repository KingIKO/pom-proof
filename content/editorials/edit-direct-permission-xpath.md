---
problem: locator/edit-direct-permission-xpath
---

```xpath
//table[@data-role-source='direct']//td[@data-field='name'][normalize-space(.)='Morgan Ives']/ancestor::tr[1]//button[normalize-space(.)='Edit']
```

Start inside the table that lists direct grants. Match the name cell by its full normalized text and then step up to the nearest row with `ancestor::tr[1]`. From that row, find the Edit button anywhere below it. This works with the action column before or after the name column, and when part of the name sits inside a span.

The decoy takes the first matching Edit button across both tables. Inherited access can also list `Morgan Ives`, so putting that table first changes the meaning of the selected button. A partial name match would also include `Morgan Ives Jr`, and a row-wide text filter could match the deputy's note that mentions Morgan.

An interviewer is looking for the distinction between positional choice across records and choosing the nearest structural ancestor of an identified cell. The nearest row is the owner of the action in this markup. Picking the first record across tables assumes an ordering unrelated to which grant the test intends to edit.

In Selenium Python, pass the same expression to `driver.find_element(By.XPATH, selector)`.

Sources: [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes), [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
