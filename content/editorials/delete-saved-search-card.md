---
problem: locator/delete-saved-search-card
---

## What is going on

Each saved search has a card with its own `Delete` button. The search title is editable, so two cards can both say `Open chargebacks`. The displayed code `SR-518` identifies the record the test wants to delete, even after a customer changes the title or the list sorts differently.

## The fix

```ts
page.getByRole('article')
  .filter({ hasText: 'SR-518' })
  .getByRole('button', { name: 'Delete', exact: true })
```

1. Start with the cards by their `article` role.

   **Why:** In `newest-search-first`, the order changes but each article still contains the record details and its own controls. That gives the next lookup a meaningful boundary without choosing any list position.

2. Keep the article containing `SR-518`.

   **Why:** In `duplicate-title-with-wrapped-actions`, the other card has the same title. The code is unique, and the text filter can find it even inside the new `strong` element and next to a translated label. The test can identify the search it originally created or loaded.

3. Find the button named exactly `Delete` inside that article.

   **Why:** In `duplicate-title-with-wrapped-actions`, the new wrapper puts the buttons one level deeper. The chained lookup still finds the descendant with the right name, and keeps `Edit` or other controls from becoming substitutes.

## Why the tempting answer fails

The decoy assumes that the first list item is the target and that the second direct button in its footer deletes it. In `newest-search-first`, that position belongs to `SR-604`. In `duplicate-title-with-wrapped-actions`, it belongs to `SR-702`. Choosing the target article but keeping the direct-child assumption would also fail once its actions gain their wrapper.

## What the interviewer listens for

Explain why a displayed record code identifies the search more reliably than its editable title. After deleting, check that `SR-518` is gone and the other same-title search remains, since a generic confirmation message could follow either deletion.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
