---
problem: locator/apply-invoice-credit-detail
---

## What is going on

The invoice table puts the credit code and its controls in two different rows. Each expanded credit has a summary and then a detail row with an `Apply credit` button. Finding the code gets you to the right summary. You still need to prove that the button you found belongs to that summary, especially when several credits are expanded.

## The fix

```xpath
//tr[@data-row='credit-summary'][th[normalize-space(.)='CR-47']]/following-sibling::tr[1][@data-row='credit-detail']//button[normalize-space(.)='Apply credit']
```

1. Find the credit summary row whose header has the exact normalized text `CR-47`.

   **Why:** In `notice-and-new-detail-layout`, part of the code is inside a span and the header has extra spaces. The element's normalized text still gives the complete code, and equality excludes the neighboring `CR-471`.

2. Take the immediately following `tr`, then require `data-row='credit-detail'`.

   **Why:** In `older-credit-first`, both rows move together, so adjacency still identifies the owner of the action. If `CR-47` is collapsed and the next row is another credit's summary, the type check fails there. Filtering for detail rows before taking `[1]` could skip ahead and apply the wrong credit.

3. Find the descendant button whose normalized text is `Apply credit`.

   **Why:** In `notice-and-new-detail-layout`, the notice leaves the pair intact, but the controls gain a wrapper, `Close details` comes first, and `Apply` sits inside a span. The descendant search and full caption survive all those changes.

In Selenium Python, pass the XPath as `selector` in `driver.find_element(By.XPATH, selector)`.

## Why the tempting answer fails

The first `Apply credit` button in a detail row happens to belong to `CR-47` originally. In `older-credit-first`, the same XPath returns one button for `CR-64`. A uniqueness check could pass even though the action would apply the wrong credit.

## What the interviewer listens for

Explain why the order of the two sibling predicates matters. If the detail row is missing, expand the known summary and wait for its own controls before applying the credit.

## Sources

- [MDN XPath axes](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes)
- [MDN XPath normalize-space](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space)
- [Selenium locator strategies](https://www.selenium.dev/documentation/webdriver/elements/locators/)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
