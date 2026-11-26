---
title: Check which actions change an order status
kind: test-design
topic: state-transitions
difficulty: medium
minutes: 11
roles: [manual-qa, automation, sdet]
exportName: nextOrderStatus
params:
  - { name: status, type: enum, label: Current status, values: [awaiting-payment, paid, shipped, delivered, cancelled] }
  - { name: action, type: enum, label: Action, values: [capture, ship, deliver, cancel] }
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
    teaches: Try fulfillment actions before the payment requirement is met.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if ((status === 'awaiting-payment' || status === 'paid') && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if ((status === 'awaiting-payment' || status === 'paid') && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: refuses-unpaid-cancellation
    teaches: Compare cancellation on either side of payment capture.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if (status === 'paid' && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: refuses-paid-cancellation
    teaches: Check that payment capture does not remove a valid way to cancel.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if (status === 'awaiting-payment' && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: cancels-after-shipment
    teaches: Check that cancellation stops changing the status once fulfillment starts.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if (status === 'shipped' && action === 'deliver') return 'delivered';
        if ((status === 'awaiting-payment' || status === 'paid' || status === 'shipped') && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: drops-delivery-event
    teaches: Assert the final transition on the successful fulfillment path.
    implementation: |
      export function nextOrderStatus(status, action) {
        if (status === 'awaiting-payment' && action === 'capture') return 'paid';
        if (status === 'paid' && action === 'ship') return 'shipped';
        if ((status === 'awaiting-payment' || status === 'paid') && action === 'cancel') return 'cancelled';
        return status;
      }
  - name: reopens-cancelled-order
    teaches: Try events that arrive late and check that terminal statuses hold.
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

The order service computes one change at a time with `nextOrderStatus(status, action)`. The function returns the next status as a string.

| Current status | Action | Next status |
| --- | --- | --- |
| `awaiting-payment` | `capture` | `paid` |
| `paid` | `ship` | `shipped` |
| `shipped` | `deliver` | `delivered` |
| `awaiting-payment` | `cancel` | `cancelled` |
| `paid` | `cancel` | `cancelled` |

Every other combination of the listed statuses and actions returns the current status unchanged. In particular, `delivered` and `cancelled` are terminal.

Enter test rows or write a JavaScript `export function test(nextOrderStatus)` that throws on an unexpected result.
