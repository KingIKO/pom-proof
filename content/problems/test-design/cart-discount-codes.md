---
title: Check discount code eligibility
kind: test-design
topic: equivalence-partitioning
difficulty: easy
minutes: 8
roles: [manual-qa, automation]
exportName: cartDiscount
params:
  - { name: code, type: string, label: Discount code }
  - { name: firstOrder, type: boolean, label: First order }
implementation: |
  export function cartDiscount(code, firstOrder) {
    const normalized = code.replace(/^ +| +$/g, '').replace(/[a-z]/g, (letter) => letter.toUpperCase());
    if (normalized === 'FIRST10' && firstOrder) return 10;
    if (normalized === 'SAVE5') return 5;
    return 0;
  }
mutants:
  - name: compares-exact-case
    teaches: Try a recognized code with mixed case and no extra spaces.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/^ +| +$/g, '');
        if (normalized === 'FIRST10' && firstOrder) return 10;
        if (normalized === 'SAVE5') return 5;
        return 0;
      }
  - name: retains-outer-spaces
    teaches: Put ordinary spaces around a recognized code.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/[a-z]/g, (letter) => letter.toUpperCase());
        if (normalized === 'FIRST10' && firstOrder) return 10;
        if (normalized === 'SAVE5') return 5;
        return 0;
      }
  - name: allows-repeat-use
    teaches: Try the first-order code on a returning shopper.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/^ +| +$/g, '').replace(/[a-z]/g, (letter) => letter.toUpperCase());
        if (normalized === 'FIRST10') return 10;
        if (normalized === 'SAVE5') return 5;
        return 0;
      }
  - name: omits-open-code
    teaches: Try the public code on a shopper who is not placing a first order.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/^ +| +$/g, '').replace(/[a-z]/g, (letter) => letter.toUpperCase());
        if (normalized === 'FIRST10' && firstOrder) return 10;
        return 0;
      }
  - name: removes-internal-spaces
    teaches: Insert a space inside an otherwise recognized code.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/ /g, '').replace(/[a-z]/g, (letter) => letter.toUpperCase());
        if (normalized === 'FIRST10' && firstOrder) return 10;
        if (normalized === 'SAVE5') return 5;
        return 0;
      }
reference:
  source: |
    export function test(cartDiscount) {
      const cases = [
        ['FIRST10', true, 10], ['FIRST10', false, 0], ['SAVE5', false, 5],
        ['SaVe5', true, 5], [' FIRST10 ', true, 10], ['SAVE 5', false, 0],
        ['MISSING', false, 0], ['', true, 0],
      ];
      for (const [code, firstOrder, expected] of cases) {
        const actual = cartDiscount(code, firstOrder);
        if (actual === expected) continue;
        throw new Error(`${JSON.stringify(code)}, first order ${firstOrder}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [FIRST10, true], expected: 10 }
    - { args: [FIRST10, false], expected: 0 }
    - { args: [SAVE5, false], expected: 5 }
    - { args: [SaVe5, true], expected: 5 }
    - { args: [' FIRST10 ', true], expected: 10 }
    - { args: ['SAVE 5', false], expected: 0 }
    - { args: [MISSING, false], expected: 0 }
    - { args: ['', true], expected: 0 }
decoy:
  rows:
    - { args: [FIRST10, true], expected: 10 }
    - { args: [SAVE5, false], expected: 5 }
    - { args: [MISSING, false], expected: 0 }
---

Checkout calls `cartDiscount(code, firstOrder)` with the entered code and whether this is the shopper's first order. The function returns a whole-number percentage, so `10` means 10 percent.

Ignore ordinary ASCII spaces at the start and end of the code and ignore the case of ASCII letters. Internal spaces and other characters are significant.

- `FIRST10` gives 10 percent on a first order and 0 otherwise.
- `SAVE5` gives 5 percent on any order.
- An empty or unrecognized code gives 0.

Enter test rows or write a JavaScript `export function test(cartDiscount)` that throws on an unexpected result.
