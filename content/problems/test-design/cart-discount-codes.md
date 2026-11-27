---
title: Check when discount codes apply
kind: test-design
topic: equivalence-partitioning
difficulty: easy
minutes: 8
roles: [manual-qa, automation]
exportName: cartDiscount
params:
  - { name: code, type: string, label: Code entered }
  - { name: firstOrder, type: boolean, label: Shopper’s first order }
implementation: |
  export function cartDiscount(code, firstOrder) {
    const normalized = code.replace(/^ +| +$/g, '').replace(/[a-z]/g, (letter) => letter.toUpperCase());
    if (normalized === 'FIRST10' && firstOrder) return 10;
    if (normalized === 'SAVE5') return 5;
    return 0;
  }
mutants:
  - name: compares-exact-case
    teaches: Use both uppercase and lowercase letters in a known code. Leave out any extra spaces.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/^ +| +$/g, '');
        if (normalized === 'FIRST10' && firstOrder) return 10;
        if (normalized === 'SAVE5') return 5;
        return 0;
      }
  - name: retains-outer-spaces
    teaches: Add ordinary spaces at both ends of a known code.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/[a-z]/g, (letter) => letter.toUpperCase());
        if (normalized === 'FIRST10' && firstOrder) return 10;
        if (normalized === 'SAVE5') return 5;
        return 0;
      }
  - name: allows-repeat-use
    teaches: Use the first-order code for a shopper who has ordered before.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/^ +| +$/g, '').replace(/[a-z]/g, (letter) => letter.toUpperCase());
        if (normalized === 'FIRST10') return 10;
        if (normalized === 'SAVE5') return 5;
        return 0;
      }
  - name: omits-open-code
    teaches: Use the public code for a shopper who has ordered before.
    implementation: |
      export function cartDiscount(code, firstOrder) {
        const normalized = code.replace(/^ +| +$/g, '').replace(/[a-z]/g, (letter) => letter.toUpperCase());
        if (normalized === 'FIRST10' && firstOrder) return 10;
        return 0;
      }
  - name: removes-internal-spaces
    teaches: Add a space inside a known code.
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

Checkout passes the entered code and whether this is the shopper's first order to the `cartDiscount(code, firstOrder)` function. The function returns a percentage as a whole number. For example, `10` means 10 percent.

ASCII is the basic set of characters that includes plain English letters and the ordinary space. Ignore ASCII spaces at either end of the code. Treat uppercase and lowercase ASCII letters the same. Spaces inside the code and other characters still affect the match.

- If this is the shopper's first order, `FIRST10` gives 10 percent. For any later order, it gives 0.
- Use `SAVE5` to get 5 percent on any order.
- If the code is empty or unknown, the discount is 0.

Enter test rows or write the JavaScript function `export function test(cartDiscount)`. If the result differs from what you expected, throw an error.
