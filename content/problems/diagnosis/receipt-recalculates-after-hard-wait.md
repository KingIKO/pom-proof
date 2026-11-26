---
title: A receipt total still shows the old price
kind: diagnosis
topic: playwright
difficulty: easy
minutes: 5
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: What caused this failure?
    choices:
      - { id: selector, text: The test reads a different total with the same test ID. }
      - { id: snapshot, text: The test takes a text snapshot before the update renders. }
      - { id: shipping, text: The server calculates the wrong amount for two items. }
      - { id: click, text: The click never reaches the quantity button. }
  - id: fix
    type: single-choice
    prompt: Which change keeps the check meaningful?
    choices:
      - { id: delay, text: Increase the fixed wait to two seconds before reading the total. }
      - { id: retry, text: Add a test retry without changing the assertion. }
      - { id: response, text: Check only that the pricing request returns 200. }
      - { id: visible-total, text: Remove the fixed wait and assert the expected text directly on the total locator. }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis?
    choices:
      - { id: same-node, text: The same total changes to $28.00 after the failing snapshot. }
      - { id: status-only, text: The pricing response has status 200. }
      - { id: delayed-price, text: "With the price update delayed past 300 ms, the locator assertion passes when the text changes." }
      - { id: green, text: An unchanged rerun passes without a trace. }
reference:
  cause: snapshot
  fix: visible-total
  evidence: [same-node, delayed-price]
decoy:
  cause: snapshot
  fix: delay
  evidence: [same-node, green]
---

A seeded cart has one $14 item. The test checks that increasing the quantity updates the receipt total on screen.

```ts
await page.goto('/cart');
await page.getByRole('button', { name: 'Increase quantity' }).click();
await page.waitForTimeout(300);
const total = await page.getByTestId('receipt-total').textContent();
expect(total).toBe('$28.00');
```

```text
  0 ms  Increase quantity click completes
 18 ms  POST /api/cart/quantity { quantity: 2 }
305 ms  receipt-total text snapshot: "$14.00" (one matching node)
306 ms  Assertion fails: expected "$28.00", got "$14.00"
484 ms  POST response: 200 { totalCents: 2800 }
509 ms  Last cart snapshot captured before CI teardown: "$28.00"
```
