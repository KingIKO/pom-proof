---
title: Check how weight and service affect the shipping price
kind: test-design
topic: decision-tables
difficulty: medium
minutes: 12
roles: [manual-qa, automation, sdet]
exportName: quoteShipment
params:
  - { name: grams, type: number, label: Parcel weight (grams) }
  - { name: member, type: boolean, label: Active member }
  - { name: express, type: boolean, label: Use express shipping }
implementation: |
  export function quoteShipment(grams, member, express) {
    if (grams > 20000) return -1;
    const base = grams <= 5000 ? 600 : 1000;
    if (express) return base + 700;
    return member ? base - 300 : base;
  }
mutants:
  - name: applies-heavy-rate-early
    teaches: Use the highest weight that still gets the lower base price.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams > 20000) return -1;
        const base = grams < 5000 ? 600 : 1000;
        if (express) return base + 700;
        return member ? base - 300 : base;
      }
  - name: rejects-exact-weight-limit
    teaches: Use the highest weight the service will ship.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams >= 20000) return -1;
        const base = grams <= 5000 ? 600 : 1000;
        if (express) return base + 700;
        return member ? base - 300 : base;
      }
  - name: discounts-member-express
    teaches: Give a member express shipping. Check that they get no member discount.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams > 20000) return -1;
        const base = grams <= 5000 ? 600 : 1000;
        if (express) return base + 700 - (member ? 300 : 0);
        return member ? base - 300 : base;
      }
  - name: omits-heavy-express-surcharge
    teaches: Choose express for a heavy parcel within the shipping limit.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams > 20000) return -1;
        const base = grams <= 5000 ? 600 : 1000;
        if (express) return grams <= 5000 ? base + 700 : base;
        return member ? base - 300 : base;
      }
  - name: omits-heavy-member-discount
    teaches: Use standard shipping for a member sending a heavy parcel.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams > 20000) return -1;
        const base = grams <= 5000 ? 600 : 1000;
        if (express) return base + 700;
        return member && grams <= 5000 ? base - 300 : base;
      }
reference:
  source: |
    export function test(quoteShipment) {
      const cases = [
        [5000, false, false, 600], [5000, true, false, 300],
        [5000, false, true, 1300], [5000, true, true, 1300],
        [5001, false, false, 1000], [5001, true, false, 700],
        [5001, false, true, 1700], [5001, true, true, 1700],
        [20000, false, false, 1000], [20001, true, true, -1],
      ];
      for (const [grams, member, express, expected] of cases) {
        const actual = quoteShipment(grams, member, express);
        if (actual === expected) continue;
        throw new Error(`${grams} g, member ${member}, express ${express}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [5000, false, false], expected: 600 }
    - { args: [5000, true, false], expected: 300 }
    - { args: [5000, false, true], expected: 1300 }
    - { args: [5000, true, true], expected: 1300 }
    - { args: [5001, false, false], expected: 1000 }
    - { args: [5001, true, false], expected: 700 }
    - { args: [5001, false, true], expected: 1700 }
    - { args: [5001, true, true], expected: 1700 }
    - { args: [20000, false, false], expected: 1000 }
    - { args: [20001, true, true], expected: -1 }
decoy:
  rows:
    - { args: [1500, false, false], expected: 600 }
    - { args: [1500, true, false], expected: 300 }
    - { args: [8000, false, true], expected: 1700 }
    - { args: [22000, false, false], expected: -1 }
---

The `quoteShipment(grams, member, express)` function returns the price to ship a parcel in whole cents. Weight is a whole number of grams greater than zero. The `member` input says whether the customer has an active membership. If `express` is `true`, use express shipping. If it is `false`, use standard shipping.

- If a parcel weighs more than 20,000 grams, return `-1`. It cannot ship with any service or membership.
- The base price is the price before extras or discounts. It is 600 cents through 5,000 grams, including exactly 5,000 grams. Above that weight and up to the shipping limit, it is 1,000 cents.
- If the customer chooses express shipping, add 700 cents to the base price. This applies to all customers.
- If a member chooses standard shipping, subtract 300 cents from the base price. Members get this discount only on standard shipping. If the customer is not a member, standard shipping costs the base price.

Enter test rows or write the JavaScript function `export function test(quoteShipment)`. If the result differs from what you expected, throw an error.
