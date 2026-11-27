---
problem: locator/cancel-pending-receipt-delivery
---

## What is going on

A receipt may have more than one delivery attempt. A failed attempt can stay on the page with its own `Cancel` button. At the same time, a new delivery of the same receipt can be pending, which means it is waiting to be sent. The test needs the visible pending attempt for `RC-602`. Matching only the receipt code tells you which receipt you found, but not which attempt.

The fix is a locator, an expression that finds an element on the page. Its first part is a CSS selector, a pattern that matches elements by tag name and attributes. An attribute is a named value in an element's HTML tag.

## The fix

```ts
page.locator('article[data-delivery-state="pending"]')
  .filter({ hasText: 'RC-602' })
  .getByRole('button', { name: 'Cancel', exact: true })
```

1. Start with the `article` elements that have `data-delivery-state="pending"`.

   **Why:** In the `failed-attempt-retained` layout, the failed attempt and the pending attempt have the same receipt code. The state attribute tells them apart before their order on the page matters. In `hidden-card-and-translated-status`, the schedule text changes language. So a check for the text `Queued for` would drop the correct card.

2. Keep the pending articles that contain `RC-602`.

   **Why:** In `failed-attempt-retained`, `RC-711` is also pending. The filter checks the text inside each article separately. So it leaves out the `RC-711` delivery, even when that card comes before the target.

3. Find the descendant button named exactly `Cancel`, at any depth inside the article.

   **Why:** In `hidden-card-and-translated-status`, a hidden pending article is still in the DOM, the browser's tree of page elements. The CSS part of the locator still matches that hidden article. The role lookup, `getByRole`, skips hidden elements by default, so it leaves out that article's button. On the visible card, the buttons move into a wrapper, and the exact name still tells `Cancel` apart from `Details`.

## Why the tempting answer fails

The tempting answer takes the first `Cancel` button in any article that mentions `RC-602`. That works when the page lists only one attempt for the receipt. In `failed-attempt-retained` and `hidden-card-and-translated-status`, the first visible match belongs to the earlier failed attempt. The receipt code is correct in both layouts. So a check of the code alone would miss the mistake.

## What the interviewer listens for

When a receipt can be sent again, two separate questions matter. The receipt code tells you which receipt it is. The state tells you which attempt it is. Explain why the locator needs both.

After you cancel, check that the pending attempt changed state. Also check that the failed attempt is still in the history.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
