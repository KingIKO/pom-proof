---
problem: locator/cancel-pending-receipt-delivery
---

```ts
page.locator('article[data-delivery-state="pending"]')
  .filter({ hasText: 'RC-602' })
  .getByRole('button', { name: 'Cancel', exact: true })
```

Use the machine-readable state to tell current deliveries from failed attempts. Filter those cards by receipt code, then select the named button inside them. The raw CSS part can see a hidden pending card because it matches the DOM. The final role lookup excludes the hidden card's button, leaving only the visible cancellation action.

The decoy finds the first `Cancel` on an article mentioning `RC-602`, which works when one attempt is listed. When a failed attempt is kept above the pending one, it selects the failed attempt's action. The translated view keeps that same older attempt and also adds a hidden pending card. Filtering on a phrase such as `Queued for` would tie the test to one language and a particular way of displaying the schedule.

Explain to the interviewer why receipt identity and delivery state are separate. The same receipt can be attempted again. To test that cancellation worked, check that the pending attempt changed state while the failed attempt remains in the history.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices). See [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors) for the CSS scope.
