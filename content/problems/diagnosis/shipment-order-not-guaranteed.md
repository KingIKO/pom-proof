---
title: The shipment list changes order
kind: diagnosis
topic: assertions
difficulty: medium
minutes: 6
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Why does the reported assertion fail?
    choices:
      - { id: hydration, text: The assertion checks while the panel still contains a partial list. }
      - { id: duplicate, text: The shipment list displays a duplicate label and drops another label. }
      - { id: expected-order, text: The assertion assumes an order that the panel does not promise. }
      - { id: request, text: The second response is missing the Evening delivery shipment. }
  - id: fix
    type: single-choice
    prompt: What should the test assert after the panel has loaded?
    choices:
      - { id: assert-first, text: Assert only the first label and accept whichever of the expected values appears there. }
      - { id: any-order, text: "Compare sorted copies of the full expected and displayed label arrays, preserving duplicates." }
      - { id: retry, text: Retry on a mismatch until the expected order appears. }
      - { id: product-sort, text: Add alphabetical sorting to the product so the test's expected order can stay fixed. }
  - id: evidence
    type: multi-select
    prompt: Which observations would justify the assertion change and test its limits?
    choices:
      - { id: permute, text: Two settled responses with the same labels in reverse order produce correspondingly reordered lists with no missing entries. }
      - { id: count, text: Both versions of the panel contain two shipment cards. }
      - { id: test-negatives, text: The new assertion passes both orders and fails a fixture that duplicates one label in place of the other. }
      - { id: no-warn, text: The browser console has no warnings during rendering. }
reference:
  cause: expected-order
  fix: any-order
  evidence: [permute, test-negatives]
decoy:
  cause: expected-order
  fix: product-sort
  evidence: [permute, count]
---

The order details panel must display every shipment once. The contract does not specify the display order. `Shipments loaded` appears only once the full list is rendered.

```ts
await page.goto('/orders/o21');
const shipments = page.getByRole('region', { name: 'Shipments' });
await expect(shipments.getByText('Shipments loaded')).toBeVisible();
const labels = await shipments.getByTestId('shipment-label').allTextContents();
expect(labels).toEqual(['Warehouse pickup', 'Evening delivery']);
```

```text
pass response  labels=["Warehouse pickup","Evening delivery"]
fail response  labels=["Evening delivery","Warehouse pickup"]
fail UI        loaded=true labels=["Evening delivery","Warehouse pickup"]
fail assert    arrays have the same two labels in a different order
```
