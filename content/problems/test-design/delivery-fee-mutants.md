---
title: Test the delivery fee boundary
kind: test-design
topic: boundary-testing
difficulty: medium
minutes: 10
roles: [automation, sdet]
exportName: quoteFee
implementation: |
  export function quoteFee(subtotalCents, zone) {
    if (zone === 'remote') return 900;
    return subtotalCents >= 5000 ? 0 : 450;
  }
mutants:
  - name: excludes-threshold
    teaches: Check the exact free-delivery threshold.
    implementation: |
      export function quoteFee(subtotalCents, zone) {
        if (zone === 'remote') return 900;
        return subtotalCents > 5000 ? 0 : 450;
      }
  - name: includes-one-cent-below
    teaches: Check the charged side immediately below the threshold.
    implementation: |
      export function quoteFee(subtotalCents, zone) {
        if (zone === 'remote') return 900;
        return subtotalCents >= 4999 ? 0 : 450;
      }
  - name: waives-remote-fee
    teaches: Cross the subtotal threshold with the remote-zone rule.
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
decoy:
  source: |
    export function test(quoteFee) {
      if (quoteFee(2400, 'local') !== 450) throw new Error('Low subtotal has a fee');
      if (quoteFee(9200, 'local') !== 0) throw new Error('High subtotal has no fee');
      if (quoteFee(2400, 'remote') !== 900) throw new Error('Remote orders have a fee');
    }
---

The delivery quote module accepts a subtotal in integer cents and a zone. A `local` order costs 450 cents to deliver below 5,000 cents and is free from 5,000 cents. Every `remote` order costs 900 cents to deliver.

Write a JavaScript `export function test(quoteFee)` that throws an error on a failed assertion. It should pass against the real function and reject each faulty version. These checks sit below the Playwright checkout test so a pricing mistake can be found without opening a browser.
