---
problem: locator/find-statement-delivery-summary
---

```xpath
//dt[normalize-space(.)='Paper statement']/following-sibling::*[1][self::dd]
```

The term tells you which delivery option you are reading. Locate the `dt` by its entire normalized text. Then choose the first following element sibling and require that it is a `dd`. Taking the first element before checking its type expresses the immediate-next relationship. `following-sibling::dd[1]` could skip intervening element types and accidentally accept a different description.

The first `dd` directly under the list is correct only in the original fixture. Once electronic delivery comes first, the same XPath reports the email setting. With a wrapper around each term and description, no `dd` is directly under the list. The reference still works because the two elements remain siblings inside their wrapper. Matching the description text would also fail after translation.

In an interview, explain where the remaining assumption comes from: the app presents one description immediately after the named term. If a redesign allows several terms for one description, revisit that assumption and use the actual grouping rule. Adding more indices would obscure the change in how the relationship works.

Sources: [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes), [MDN normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
