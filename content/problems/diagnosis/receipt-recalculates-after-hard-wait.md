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
      - { id: selector, text: The test reads a different total that has the same test ID. }
      - { id: snapshot, text: The test takes a text snapshot before the page shows the update. }
      - { id: shipping, text: The server calculates the wrong amount for two items. }
      - { id: click, text: The click never reaches the quantity button. }
  - id: fix
    type: single-choice
    prompt: Which change keeps the check meaningful?
    choices:
      - { id: delay, text: "Before reading the total, raise the fixed wait to two seconds." }
      - { id: retry, text: Retry the test on failure and leave the existing assertion as it is. }
      - { id: response, text: Check only that the pricing request returns a response with status 200. }
      - { id: visible-total, text: Replace the fixed wait with a text assertion on the total's locator. }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis?
    choices:
      - { id: same-node, text: "After the text snapshot fails the check, the same total changes to $28.00." }
      - { id: status-only, text: The pricing service responds to the request from the browser with HTTP status 200. }
      - { id: delayed-price, text: "With the price update held past 300 ms, the locator check passes when the text changes." }
      - { id: green, text: The test passes on another run with no changes and no recorded browser trace. }
reference:
  cause: snapshot
  fix: visible-total
  evidence: [same-node, delayed-price]
decoy:
  cause: snapshot
  fix: delay
  evidence: [same-node, green]
---

A seeded cart, created before the test runs, has one $14 item. The test checks that raising the quantity updates the receipt total on screen. The `textContent()` call reads the element's text once, like a snapshot. A locator is Playwright's description of how to find an element on the page.

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
