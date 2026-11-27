---
problem: locator/find-backup-status
---

## What is going on

The backup dashboard lists a status beside each job. The exercise asks for the status element with the full caption `Waiting for storage`. Another job may have a longer message starting with those words, so the wording matters. Spacing and inline formatting can change without changing what the status says. An extra approval requirement, on the other hand, is a different status even if the two messages start alike.

## The fix

```xpath
//span[normalize-space(.)='Waiting for storage']
```

1. Search for `span` elements without specifying a row position.

   **Why:** In `changed-sort-and-spacing`, Billing moves above Warehouse, but the status is still a span. Searching for the element type allows its position to change and gives the text test the element it needs to examine.

2. Compare `normalize-space(.)` with the exact caption `Waiting for storage`.

   **Why:** In `changed-sort-and-spacing`, normalization trims the ends and collapses the extra whitespace between words. In `nested-status-caption`, the dot refers to the span, whose string value includes `storage` inside `strong`. Equality still excludes `Waiting for storage approval`.

## Why the tempting answer fails

`//ul/li[1]/span` works while Warehouse is first. In `changed-sort-and-spacing`, it points to Billing's `Complete` status. In `nested-status-caption`, it points to Analytics's longer waiting message. Changing the positional shortcut to a raw equality test against a single direct text node would solve the sorting dependency but would still miss the caption when whitespace changes or a word moves into another element.

## What the interviewer listens for

Explain that whitespace normalization tolerates formatting changes and equality still requires the same wording. If two jobs could show the same status, scope to the named job before checking its caption, since either span could satisfy the XPath on its own.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [XPath element string values](https://www.w3.org/TR/xpath-10/#element-nodes)
