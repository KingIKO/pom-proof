---
problem: locator/find-backup-status
---

## What is going on

The backup dashboard shows a status beside each job. The exercise asks for the status element whose full caption is `Waiting for storage`. The exact wording matters, because another job may show a longer message that starts with the same words. Spacing and inline formatting can change while the status still says the same thing. An extra approval requirement makes a different status, even if the two messages start alike.

The fix uses XPath, a language that finds elements in the page markup by their type, position or text. Its `normalize-space` function tidies the whitespace in a piece of text. It trims spaces from both ends and turns each run of spaces between words into one space.

## The fix

```xpath
//span[normalize-space(.)='Waiting for storage']
```

1. Search for `span` elements without naming a row position.

   **Why:** A `span` is a plain inline HTML element, and each status here sits in one. In `changed-sort-and-spacing`, Billing moves above Warehouse, but the status is still a span. A search by element type keeps working when the position changes. It also gives the text check the element it needs to examine.

2. Compare `normalize-space(.)` with the exact caption `Waiting for storage`.

   **Why:** In `changed-sort-and-spacing`, normalization trims the ends and collapses the extra spaces between words. The dot (`.`) means the span itself. Its string value is all the text inside it, including text in child elements. In `nested-status-caption`, that text includes `storage` inside `strong`. The equals test still rules out `Waiting for storage approval`.

## Why the tempting answer fails

`//ul/li[1]/span` picks the span in the first list item. It works while Warehouse is first. In `changed-sort-and-spacing`, it points to Billing's `Complete` status. In `nested-status-caption`, it points to Analytics's longer waiting message.

You could drop the position and test a single direct text node for an exact match instead. A text node is one run of text directly inside an element. That change would remove the dependence on sort order. It would still miss the caption when the whitespace changes. It would also miss the caption when a word moves into another element.

## What the interviewer listens for

Explain that whitespace normalization tolerates formatting changes. The equals test still requires the same wording. Two jobs might show the same status. In that case, either span could match the XPath on its own. So narrow the search to the named job first, then check its caption.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [XPath element string values](https://www.w3.org/TR/xpath-10/#element-nodes)
