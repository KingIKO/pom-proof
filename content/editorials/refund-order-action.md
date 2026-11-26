---
problem: locator/refund-order-action
---

```ts
const refund = page.getByRole('button', { name: 'Refund order PP104', exact: true });
await expect(refund).toHaveCount(1);
```

Both buttons have the same visible text, but the role and accessible name identify the order. A selector based on the second child matches the wrong action when the buttons trade places and matches nothing when the wrapper changes.
