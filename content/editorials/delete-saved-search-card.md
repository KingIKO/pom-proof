---
problem: locator/delete-saved-search-card
---

## What is going on

Each saved search has a card with its own `Delete` button. Customers can edit the search title, so two cards can both say `Open chargebacks`. The code `SR-518` shows on the card and identifies the search the test wants to delete. It still does so after a customer changes the title or the list is sorted differently.

## The fix

```ts
page.getByRole('article')
  .filter({ hasText: 'SR-518' })
  .getByRole('button', { name: 'Delete', exact: true })
```

1. Start with the cards by their `article` role.

   **Why:** A role is the kind of element the browser reports to assistive tools, such as article or button. In the `newest-search-first` layout, the order changes. Each article still holds its search's details and its own buttons. So each article gives the next lookup a clear boundary, and the test does not need to pick a position in the list.

2. Keep the article containing `SR-518`.

   **Why:** In `duplicate-title-with-wrapped-actions`, the other card has the same title. The code is unique, though. The text filter still finds it inside the new `strong` element, next to a translated label. So the test can pick out the search it originally created or loaded.

3. Find the button named exactly `Delete` inside that article.

   **Why:** In `duplicate-title-with-wrapped-actions`, a new wrapper puts the buttons one level deeper. The chained lookup runs only inside the article. It searches every descendant, meaning every element nested inside the article at any depth. So it still finds the button with the right name. The exact name also stops `Edit` or another button from being picked instead.

## Why the tempting answer fails

The tempting answer makes two assumptions. The target is the first item in the list. The second button directly inside that item's footer deletes it. In `newest-search-first`, that position belongs to `SR-604`. In `duplicate-title-with-wrapped-actions`, it belongs to `SR-702`.

A direct child sits right inside its parent, with no wrapper in between. Suppose you picked the correct article but kept the direct-child assumption. That would still fail once the buttons gain their wrapper.

## What the interviewer listens for

Explain why the code shown on the card identifies the search more reliably than its editable title. After deleting, check that `SR-518` is gone. Also check that the other search with the same title is still there. A generic confirmation message could follow either deletion, so the message alone does not show which search was deleted.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
