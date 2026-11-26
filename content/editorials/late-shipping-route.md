---
problem: diagnosis/late-shipping-route
---

Register the route before the destination click. The original request had already completed when the route was registered, so the assertion was observing the real response.

```ts
await page.route('**/api/shipping/quote?city=toronto', (route) =>
  route.fulfill({ json: { options: [{ label: 'Evening delivery' }] } }),
);
await page.getByRole('button', { name: 'Toronto', exact: true }).click();
await expect(page.getByRole('radio', { name: 'Evening delivery' })).toBeVisible();
```

If this still fails, inspect the recorded request URL and the response contract. Increasing the assertion timeout cannot change a response the browser already received.
