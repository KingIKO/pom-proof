---
problem: locator/find-statement-delivery-summary
---

## What is going on

The statement preferences use a description list. The term says which option you are reading, and the next element gives its description. The description for paper delivery can be translated, and the whole pair can move or gain a wrapper. Use the stable term and its relationship to the answer.

## The fix

```xpath
//dt[normalize-space(.)='Paper statement']/following-sibling::*[1][self::dd]
```

1. Find the `dt` whose normalized text is exactly `Paper statement`.

   **Why:** In `grouped-terms-with-translated-values`, `statement` sits inside a span and the description becomes `Par courrier postal`. The term's complete element text still names the option, so the locator does not need to know the current translation of the answer.

2. Take the first following element sibling with `following-sibling::*[1]`.

   **Why:** In `grouped-terms-with-translated-values`, the pair gains a `div`, yet both elements have the same parent. The sibling step starts from the selected term, so it still reaches the next element inside the wrapper.

3. Require the selected element to be a `dd` with `[self::dd]`.

   **Why:** In `delivery-options-reordered`, the descriptions still immediately follow their own terms. Applying this check after `[1]` enforces that relationship. `following-sibling::dd[1]` would skip an intervening element, such as another term, and could return a description from the wrong pair if the expected one were missing.

## Why the tempting answer fails

The first `dd` directly under the list is the paper description originally. In `delivery-options-reordered`, it reports the email setting. In `grouped-terms-with-translated-values`, neither description is a direct child of the list and the decoy finds nothing. Matching the old description text would also fail after translation.

## What the interviewer listens for

State the assumption that one description immediately follows the named term. If a redesign allows several terms to share a description, base the locator on the new grouping rule before changing any indices.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
