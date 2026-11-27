---
problem: locator/apply-invoice-credit-detail
---

## What is going on

The invoice table puts each credit code and its buttons in two different rows. An expanded credit has a summary row with the code. A detail row with an `Apply credit` button comes right after it. Finding the code leads you to the right summary row. You still need to prove that the button belongs to that summary, especially when several credits are expanded.

The fix is a locator, an expression that finds an element on the page. It uses XPath, a language that searches the markup, the code that describes the page. XPath can match elements by their tags, their text, or their position. It can also match attributes, which are named values on an element.

## The fix

```xpath
//tr[@data-row='credit-summary'][th[normalize-space(.)='CR-47']]/following-sibling::tr[1][@data-row='credit-detail']//button[normalize-space(.)='Apply credit']
```

1. Find the credit summary row whose header has the exact normalized text `CR-47`.

   **Why:** The `normalize-space(.)` function reads all text inside the element, including text inside nested elements. It trims the ends and replaces each run of whitespace with one space. In `notice-and-new-detail-layout`, part of the code sits inside a span, an element that wraps part of the text. The header has extra spaces, but its normalized text still gives the complete code. An exact match leaves out the neighboring `CR-471`.

2. Take the immediately following `tr`, then require `data-row='credit-detail'`.

   **Why:** In `older-credit-first`, each summary row and its detail row move together. So the row right after the summary still shows which credit owns the button. If `CR-47` is collapsed, the next row may be another credit's summary. In that case the type check fails on that row. If you filtered for detail rows before taking `[1]`, the search could skip ahead and apply the wrong credit.

3. Find the descendant button whose normalized text is `Apply credit`.

   **Why:** A descendant is any element nested inside another, at any depth. In `notice-and-new-detail-layout`, the notice row leaves each summary and detail pair together. But the buttons gain a wrapper, `Close details` comes first, and `Apply` sits inside a span. Searching all descendants handles the wrapper. Matching the full caption handles the new order and the span.

In Selenium Python, pass the XPath as `selector` in `driver.find_element(By.XPATH, selector)`.

## Why the tempting answer fails

The tempting answer takes the first `Apply credit` button in any detail row. On the original page, that button belongs to `CR-47`. In `older-credit-first`, the same XPath returns one button, and it belongs to `CR-64`. A check that the locator finds exactly one element would pass. The click would still apply the wrong credit.

## What the interviewer listens for

A predicate is a condition in square brackets that filters the matches. Explain why the order of the two predicates after `following-sibling::tr` matters. With `[1]` first, the locator takes the next row and then checks its type with `[@data-row='credit-detail']`. If the type filter runs first, `[1]` takes the first detail row among all later rows at the same level.

If the detail row is missing, expand the known summary first. Wait for that summary's own buttons before you apply the credit.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
