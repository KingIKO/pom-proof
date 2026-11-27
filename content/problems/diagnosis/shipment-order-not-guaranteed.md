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
    prompt: Why does the assertion in the log fail?
    choices:
      - { id: hydration, text: The assertion runs while the panel still shows only part of the list. }
      - { id: duplicate, text: The shipment list shows one label twice and leaves out another label. }
      - { id: expected-order, text: The assertion assumes an order that the panel does not promise. }
      - { id: request, text: The second response is missing the Evening delivery shipment. }
  - id: fix
    type: single-choice
    prompt: What should the test assert after the panel has loaded?
    choices:
      - { id: assert-first, text: "Check only the first label, and accept either expected value in that position." }
      - { id: any-order, text: "Compare sorted copies of both full label arrays without dropping duplicates." }
      - { id: retry, text: "When the labels do not match, retry until the expected order appears." }
      - { id: product-sort, text: Make the product sort the labels alphabetically so the test's expected order can stay fixed. }
  - id: evidence
    type: multi-select
    prompt: Which observations would support the new assertion and test its limits?
    choices:
      - { id: permute, text: "Two complete responses list the same labels in opposite orders. The two displayed lists follow those orders without missing labels." }
      - { id: count, text: "The panel displays its shipment cards after each response. Both versions show two shipment cards." }
      - { id: test-negatives, text: "The new assertion passes for both orders. It fails if the test data repeats one label instead of the other." }
      - { id: no-warn, text: "The shipment cards appear in the panel. The browser console shows no warnings as they appear." }
reference:
  cause: expected-order
  fix: any-order
  evidence: [permute, test-negatives]
decoy:
  cause: expected-order
  fix: product-sort
  evidence: [permute, count]
---

The order details panel must show every shipment once. The contract, or agreed rule for what the panel must do, does not specify the display order. The `Shipments loaded` text appears only after the panel shows the full list.

An assertion checks a result against what the test expects. An array is an ordered list of values. The browser console shows messages from the browser and page.

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
