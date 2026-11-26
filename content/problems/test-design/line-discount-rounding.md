---
title: Check how checkout rounds a line discount
kind: test-design
topic: rounding
difficulty: medium
minutes: 10
roles: [manual-qa, automation, sdet]
exportName: discountedLineCents
params:
  - { name: unitCents, type: number, label: Unit price (cents) }
  - { name: quantity, type: number, label: Quantity }
  - { name: percent, type: number, label: Discount percentage }
implementation: |
  export function discountedLineCents(unitCents, quantity, percent) {
    const subtotal = unitCents * quantity;
    const discount = Math.floor((subtotal * percent + 50) / 100);
    return subtotal - discount;
  }
mutants:
  - name: rounds-ties-down
    teaches: Choose a subtotal and percentage whose exact discount ends in half a cent.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.floor((subtotal * percent + 49) / 100);
        return subtotal - discount;
      }
  - name: always-drops-fraction
    teaches: Use a non-tie discount whose fraction is above half a cent.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.floor(subtotal * percent / 100);
        return subtotal - discount;
      }
  - name: always-rounds-up
    teaches: Use a nonzero discount fraction below half a cent.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.ceil(subtotal * percent / 100);
        return subtotal - discount;
      }
  - name: rounds-each-unit
    teaches: Use multiple units where rounding each unit would change the total.
    implementation: |
      export function discountedLineCents(unitCents, quantity, percent) {
        const subtotal = unitCents * quantity;
        const discount = Math.floor((unitCents * percent + 50) / 100) * quantity;
        return subtotal - discount;
      }
  - name: treats-zero-as-unset
    teaches: Pass an explicit zero discount with a nonzero subtotal.
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

`discountedLineCents(unitCents, quantity, percent)` returns what the customer pays for one cart line in integer cents. All inputs are whole numbers: unit price from 0 through 100,000 cents, quantity from 1 through 99, and discount from 0 through 100 percent inclusive. A discount of 0 means no discount.

Multiply the unit price by the quantity first. Calculate the discount on that line subtotal and round the discount to the nearest cent, with an exact half cent rounded up. Subtract the rounded discount from the subtotal. Apply rounding once per line.

Enter test rows or write a JavaScript `export function test(discountedLineCents)` that throws on an unexpected result.
