---
problem: locator/find-backup-status
---

```xpath
//span[normalize-space(.)='Waiting for storage']
```

The expression compares the text of the entire status span after trimming the ends and collapsing ordinary whitespace runs. The dot refers to the span itself. Its string value includes descendant text, so the comparison still works when `storage` sits inside a `strong` element. Exact equality keeps `Waiting for storage approval` out of the result.

`//ul/li[1]/span` points to the right status before the list sorts. With Billing at the top, it finds `Complete`. In the new component it can also pick a longer waiting message from the first row. A raw comparison with a single direct text node would avoid the row-position mistake and still fail once extra spaces or inner markup are introduced.

An interviewer is listening for the difference between normalizing whitespace and loosening the wording. The XPath accepts spacing differences; it still requires the same caption. If two jobs could have identical waiting statuses, scope to the named job before checking its status. The exact caption alone would then describe both spans.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices). See [MDN normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space) for the XPath function.
