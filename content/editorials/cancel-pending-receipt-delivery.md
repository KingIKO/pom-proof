---
problem: locator/cancel-pending-receipt-delivery
---

## What is going on

A receipt may have multiple delivery attempts. A failed attempt can stay on the page with its own `Cancel` button while a new delivery for the same receipt is pending. The test needs the visible pending attempt for `RC-602`. A match on just the receipt code tells you which receipt you found, but leaves the attempt open.

## The fix

```ts
page.locator('article[data-delivery-state="pending"]')
  .filter({ hasText: 'RC-602' })
  .getByRole('button', { name: 'Cancel', exact: true })
```

1. Start with articles carrying `data-delivery-state="pending"`.

   **Why:** In `failed-attempt-retained`, the failed attempt and the pending attempt share the receipt code. The state attribute separates them before position becomes a factor. In `hidden-card-and-translated-status`, the schedule text changes language, so a check for `Queued for` would discard the valid card.

2. Keep the pending articles that contain `RC-602`.

   **Why:** In `failed-attempt-retained`, `RC-711` is pending too. Testing the text within each article excludes that delivery even when it appears before the target.

3. Find the descendant button named exactly `Cancel`.

   **Why:** In `hidden-card-and-translated-status`, the CSS locator still matches the hidden pending article in the DOM. The role lookup excludes its hidden button by default. On the visible card, the name distinguishes `Cancel` from `Details` after the actions move into a wrapper.

## Why the tempting answer fails

The first `Cancel` on an article mentioning `RC-602` works when only one attempt for that receipt is listed. In `failed-attempt-retained` and `hidden-card-and-translated-status`, the first visible match belongs to the earlier failed attempt. The receipt code is right in both layouts, so checking the code alone would miss the mistake.

## What the interviewer listens for

Explain why state and receipt identity answer separate questions when a receipt can be retried. After cancellation, check that the pending attempt changed state and the failed attempt remains in history.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
