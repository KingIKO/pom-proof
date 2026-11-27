---
title: Check where the delivery fee changes
kind: test-design
topic: boundary-testing
difficulty: medium
minutes: 10
roles: [manual-qa, automation, sdet]
exportName: quoteFee
params:
  - { name: subtotalCents, type: number, label: Order subtotal (cents) }
  - { name: zone, type: enum, label: Delivery zone, values: [local, remote] }
implementation: |
  export function quoteFee(subtotalCents, zone) {
    if (zone === 'remote') return 900;
    return subtotalCents >= 5000 ? 0 : 450;
  }
mutants:
  - name: excludes-threshold
    teaches: Test the exact subtotal where delivery becomes free.
    implementation: |
      export function quoteFee(subtotalCents, zone) {
        if (zone === 'remote') return 900;
        return subtotalCents > 5000 ? 0 : 450;
      }
  - name: includes-one-cent-below
    teaches: Use a subtotal one cent below the free-delivery cutoff.
    implementation: |
      export function quoteFee(subtotalCents, zone) {
        if (zone === 'remote') return 900;
        return subtotalCents >= 4999 ? 0 : 450;
      }
  - name: waives-remote-fee
    teaches: Check the remote delivery fee at subtotals on both sides of the cutoff.
    implementation: |
      export function quoteFee(subtotalCents, zone) {
        if (subtotalCents >= 5000) return 0;
        return zone === 'remote' ? 900 : 450;
      }
reference:
  source: |
    export function test(quoteFee) {
      for (const [subtotal, zone, expected] of [[4999, 'local', 450], [5000, 'local', 0], [5000, 'remote', 900]]) {
        const actual = quoteFee(subtotal, zone);
        if (actual !== expected) throw new Error(`${zone} ${subtotal}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [4999, local], expected: 450 }
    - { args: [5000, local], expected: 0 }
    - { args: [5000, remote], expected: 900 }
decoy:
  source: |
    export function test(quoteFee) {
      if (quoteFee(2400, 'local') !== 450) throw new Error('Low subtotal has a fee');
      if (quoteFee(9200, 'local') !== 0) throw new Error('High subtotal has no fee');
      if (quoteFee(2400, 'remote') !== 900) throw new Error('Remote orders have a fee');
    }
---

The delivery quote uses the order subtotal in whole cents and the delivery zone. A `local` order below 5,000 cents costs 450 cents to deliver. From 5,000 cents up, local delivery is free. Every `remote` order costs 900 cents to deliver.

Fill the table with inputs and expected fees, or write the JavaScript function `export function test(quoteFee)`. If a fee differs from what you expected, throw an error. Your checks must pass with the real function and catch each faulty version.
