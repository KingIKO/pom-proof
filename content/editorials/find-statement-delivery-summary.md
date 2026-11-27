---
problem: locator/find-statement-delivery-summary
---

## What is going on

The statement preferences use a description list, the HTML `dl` element. In this list, each term (`dt`) names an option. The next element is a description (`dd`) that gives the setting for that option. The description for paper delivery can be translated. The whole pair can also move or gain a wrapper element.

So base the locator, the expression that finds the element, on two things that stay stable. One is the term's text. The other is the rule that its description comes right after it. The fix uses XPath, a language for finding elements in the page markup. Its `normalize-space` function trims spaces from the ends of the text and turns each run of spaces into one space.

## The fix

```xpath
//dt[normalize-space(.)='Paper statement']/following-sibling::*[1][self::dd]
```

1. Find the `dt` whose normalized text is exactly `Paper statement`.

   **Why:** In `grouped-terms-with-translated-values`, `statement` sits inside a span, and the description becomes `Par courrier postal`. The term's full text, including the text inside the span, still names the option. So the locator does not need to know how the description is currently translated.

2. Take the first following element sibling with `following-sibling::*[1]`.

   **Why:** A sibling is an element with the same parent. `following-sibling::*` looks at the sibling elements after the term, and `[1]` keeps the first one. In `grouped-terms-with-translated-values`, the pair gains a `div`, but the term and description still share a parent. The step starts from the selected term, so it still reaches the next element inside the wrapper.

3. Require the selected element to be a `dd` with `[self::dd]`.

   **Why:** In `delivery-options-reordered`, each description still comes right after its own term. Running this check after `[1]` enforces that rule. `following-sibling::dd[1]` would skip over an element in between, such as another term. If the expected description were missing, it could then return a description from the wrong pair.

## Why the tempting answer fails

The decoy picks the first `dd` directly under the list. On the original page, that is the paper description. In `delivery-options-reordered`, it returns the email setting. In `grouped-terms-with-translated-values`, neither description is a direct child of the list, so the decoy finds nothing. Matching the old description text would also fail after translation.

## What the interviewer listens for

State your assumption that one description comes right after the named term. If a redesign lets several terms share one description, base the locator on the new grouping rule. Do that before you change any index, such as `[1]`.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
