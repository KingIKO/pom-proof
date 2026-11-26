---
problem: locator/delete-saved-search-card
---

```ts
page.getByRole('article')
  .filter({ hasText: 'SR-518' })
  .getByRole('button', { name: 'Delete', exact: true })
```

The card identifies the saved search and the nested button identifies the operation. Filter the articles by the search code, which the page displays and keeps unique. Then look inside the matching article. A footer can gain a wrapper or add another action without changing the Delete button's accessible name or its membership in that card.

The decoy starts from the first list item and assumes Delete is the second direct button in its footer. Sorting by newest makes it select Delete for `SR-604`. Another layout places a second search titled `Open chargebacks` at the top and wraps the desired actions. The first-card selector can still point at the new search. Using the editable title as the card filter would also be ambiguous.

Tell the interviewer why you chose to match a displayed record code. It identifies the saved search that the test created or loaded. After any deletion, verify that `SR-518` is gone and that the other same-title search remains. A passing confirmation message would miss an action on the wrong card.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
