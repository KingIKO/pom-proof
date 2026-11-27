---
title: Check when an order changes status
kind: test-design
topic: state-transitions
difficulty: medium
minutes: 11
roles: [manual-qa, automation, sdet]
exportName: nextOrderStatus
params:
  - { name: status, type: enum, label: Current order status, values: [awaiting-payment, paid, shipped, delivered, cancelled] }
  - { name: action, type: enum, label: Action to take, values: [capture, ship, deliver, cancel] }
implementation: |
  export function nextOrderStatus(status, action) {
    if (status === 'awaiting-payment' && action === 'capture') return 'paid';
    if (status === 'paid' && action === 'ship') return 'shipped';
    if (status === 'shipped' && action === 'deliver') return 'delivered';
    if ((status === 'awaiting-payment' || status === 'paid') && action === 'cancel') return 'cancelled';
    return status;
  }
mutants:
  - name: ships-before-payment
    teaches: Try shipping or delivering the order before the service collects payment.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if ((status === 'awaiting-payment' || status === 'paid') && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if ((status === 'awaiting-payment' || status === 'paid') && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: refuses-unpaid-cancellation
    teaches: Try canceling before payment and after payment. Compare the results.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if (status === 'paid' && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: refuses-paid-cancellation
    teaches: Check that you can still cancel the order after the service collects payment.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if (status === 'awaiting-payment' && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: cancels-after-shipment
    teaches: Once shipping starts, check that canceling no longer changes the status.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if ((status === 'awaiting-payment' || status === 'paid' || status === 'shipped') && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: drops-delivery-event
    teaches: Check that delivering a shipped order gives it the delivered status.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if ((status === 'awaiting-payment' || status === 'paid') && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: reopens-cancelled-order
    teaches: After an order reaches a final status, check that late events leave it unchanged.
    implementation: |
      export function nextOrderStatus(status, action) {
        if ((status === 'awaiting-payment' || status === 'cancelled') && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if ((status === 'awaiting-payment' || status === 'paid') && action === 'cancel') return 'cancelled';
        return status;
      }
reference:
  source: |
    export function test(nextOrderStatus) {
      const cases = [
        ['awaiting-payment', 'capture', 'paid'], ['paid', 'ship', 'shipped'],
        ['shipped', 'deliver', 'delivered'], ['awaiting-payment', 'cancel', 'cancelled'],
        ['paid', 'cancel', 'cancelled'], ['awaiting-payment', 'ship', 'awaiting-payment'],
        ['shipped', 'cancel', 'shipped'], ['cancelled', 'capture', 'cancelled'],
        ['delivered', 'cancel', 'delivered'],
      ];
      for (const [status, action, expected] of cases) {
        const actual = nextOrderStatus(status, action);
        if (actual === expected) continue;
        throw new Error(`${status} with ${action}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [awaiting-payment, capture], expected: paid }
    - { args: [paid, ship], expected: shipped }
    - { args: [shipped, deliver], expected: delivered }
    - { args: [awaiting-payment, cancel], expected: cancelled }
    - { args: [paid, cancel], expected: cancelled }
    - { args: [awaiting-payment, ship], expected: awaiting-payment }
    - { args: [shipped, cancel], expected: shipped }
    - { args: [cancelled, capture], expected: cancelled }
    - { args: [delivered, cancel], expected: delivered }
decoy:
  rows:
    - { args: [awaiting-payment, capture], expected: paid }
    - { args: [paid, ship], expected: shipped }
    - { args: [shipped, deliver], expected: delivered }
---

The order service uses the `nextOrderStatus(status, action)` function to work out one change at a time. The function returns the next status as text. The `capture` action means the service collects payment.

| Current status | Action | Next status |
| --- | --- | --- |
| `awaiting-payment` | `capture` | `paid` |
| `paid` | `ship` | `shipped` |
| `shipped` | `deliver` | `delivered` |
| `awaiting-payment` | `cancel` | `cancelled` |
| `paid` | `cancel` | `cancelled` |

If the current status and action do not match a row, the function returns the same status. The `delivered` and `cancelled` statuses are terminal, meaning no action can change them.

Enter test rows or write the JavaScript function `export function test(nextOrderStatus)`. If the status differs from what you expected, throw an error.
