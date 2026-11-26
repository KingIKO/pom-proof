---
problem: locator/apply-invoice-credit-detail
---

```xpath
//tr[@data-row='credit-summary'][th[normalize-space(.)='CR-47']]/following-sibling::tr[1][@data-row='credit-detail']//button[normalize-space(.)='Apply credit']
```

Identify the summary row by its exact credit code. Move to its first following row, and test that this row is a credit detail row. The order of those predicates matters. Searching for the first later detail row of any group could jump to another credit if `CR-47` is collapsed. The reference instead returns no button when the next row is another credit's summary.

The first Apply credit button takes the first expanded credit. It is correct originally and points to `CR-64` when that credit moves above `CR-47`. Adding a notice above the target does not change the target group's adjacency. The wrapped credit code and button caption are matched through their normalized element text, so the selector does not depend on which characters are inside a span.

In an interview, describe how the test would handle a missing detail row. The test could expand the known summary and wait for its own controls to appear. It should not apply a different credit just because that credit happens to be expanded.

In Selenium Python, pass the XPath as `selector` in `driver.find_element(By.XPATH, selector)`.

Sources: [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes), [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
