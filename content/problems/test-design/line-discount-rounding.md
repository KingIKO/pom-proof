---
title: Check how checkout rounds the discount on a cart line
kind: test-design
topic: rounding
difficulty: medium
minutes: 10
roles: [manual-qa, automation, sdet]
exportName: discountedLineCents
params:
  - { name: unitCents, type: number, label: Price per unit (cents) }
  - { name: quantity, type: number, label: Number of units }
  - { name: percent, type: number, label: Discount percent }
implementation: |
  export function discountedLineCents(unitCents, quantity, percent) {
    const subtotal = unitCents * quantity;
    const discount = Math.floor((subtotal * percent + 50) / 100);
    return subtotal - discount;
  }
mutants:
  - name: rounds-ties-down
    teaches: Pick a subtotal and percentage that give a discount ending in exactly half a cent.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.floor((subtotal * percent + 49) / 100);
        return subtotal - discount;
      }
  - name: always-drops-fraction
    teaches: Use a discount with a fraction of a cent greater than half a cent.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.floor(subtotal * percent / 100);
        return subtotal - discount;
      }
  - name: always-rounds-up
    teaches: Use a discount with a fraction of a cent greater than zero but less than half a cent.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.ceil(subtotal * percent / 100);
        return subtotal - discount;
      }
  - name: rounds-each-unit
    teaches: Use several units where rounding them one at a time would change the total.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.floor((unitCents * percent + 50) / 100) * quantity;
        return subtotal - discount;
      }
  - name: treats-zero-as-unset
    teaches: Set the discount to zero and use a subtotal greater than zero.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.floor((subtotal * (percent || 10) + 50) / 100);
        return subtotal - discount;
      }
reference:
  source: |
    export function test(discountedLineCents) {
      const cases = [
        [14, 1, 10, 13], [15, 1, 10, 13], [16, 1, 10, 14],
        [15, 3, 10, 40], [199, 2, 0, 398], [199, 2, 100, 0],
        [200, 3, 15, 510],
      ];
      for (const [unitCents, quantity, percent, expected] of cases) {
        const actual = discountedLineCents(unitCents, quantity, percent);
        if (actual === expected) continue;
        throw new Error(`${quantity} at ${unitCents} cents, ${percent}% off: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [14, 1, 10], expected: 13 }
    - { args: [15, 1, 10], expected: 13 }
    - { args: [16, 1, 10], expected: 14 }
    - { args: [15, 3, 10], expected: 40 }
    - { args: [199, 2, 0], expected: 398 }
    - { args: [199, 2, 100], expected: 0 }
    - { args: [200, 3, 15], expected: 510 }
decoy:
  rows:
    - { args: [200, 3, 15], expected: 510 }
    - { args: [199, 2, 0], expected: 398 }
    - { args: [500, 1, 50], expected: 250 }
---

The `discountedLineCents(unitCents, quantity, percent)` function returns what the customer pays for one cart line in whole cents. One cart line can hold several units of the same item. All inputs are whole numbers. The unit price is 0 through 100,000 cents. The quantity is 1 through 99.

The discount ranges from 0 through 100 percent, including both ends. A discount of 0 leaves the price unchanged.

Multiply the unit price by the quantity to get the line subtotal. Calculate the discount on that subtotal. Round the discount to the nearest cent. If the fraction is exactly half a cent, round up. Subtract the rounded discount from the subtotal.

Round only once per cart line. Enter test rows or write the JavaScript function `export function test(discountedLineCents)`. If the result differs from what you expected, throw an error.
