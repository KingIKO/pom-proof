---
title: Check shipping prices by weight and service
kind: test-design
topic: decision-tables
difficulty: medium
minutes: 12
roles: [manual-qa, automation, sdet]
exportName: quoteShipment
params:
  - { name: grams, type: number, label: Weight (grams) }
  - { name: member, type: boolean, label: Member }
  - { name: express, type: boolean, label: Express }
implementation: |
  export function quoteShipment(grams, member, express) {
    if (grams > 20000) return -1;
    const base = grams <= 5000 ? 600 : 1000;
    if (express) return base + 700;
    return member ? base - 300 : base;
  }
mutants:
  - name: applies-heavy-rate-early
    teaches: Try the heaviest parcel that still qualifies for the light rate.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams > 20000) return -1;
        const base = grams < 5000 ? 600 : 1000;
        if (express) return base + 700;
        return member ? base - 300 : base;
      }
  - name: rejects-exact-weight-limit
    teaches: Try a parcel exactly at the shipping weight limit.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams >= 20000) return -1;
        const base = grams <= 5000 ? 600 : 1000;
        if (express) return base + 700;
        return member ? base - 300 : base;
      }
  - name: discounts-member-express
    teaches: Pair membership with express and check that the member discount does not apply.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams > 20000) return -1;
        const base = grams <= 5000 ? 600 : 1000;
        if (express) return base + 700 - (member ? 300 : 0);
        return member ? base - 300 : base;
      }
  - name: omits-heavy-express-surcharge
    teaches: Try express for a heavy parcel that can still ship.
    implementation: |
      export function quoteShipment(grams, member, express) {
        if (grams > 20000) return -1;
        const base = grams <= 5000 ? 600 : 1000;
        if (express) return grams <= 5000 ? base + 700 : base;
        return member ? base - 300 : base;
      }
  - name: omits-heavy-member-discount
    teaches: Try standard service as a member with a heavy parcel.
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

`quoteShipment(grams, member, express)` quotes a parcel in integer cents. Weight is a positive whole number of grams. `member` indicates an active membership; `express` selects express service when `true` and standard service when `false`.

- Parcels above 20,000 grams cannot ship. Return `-1` regardless of membership or service.
- The base price is 600 cents through 5,000 grams inclusive, and 1,000 cents above that up to the shipping limit.
- Express adds 700 cents to the base price for all customers.
- Members save 300 cents off the base price on standard service only. Standard service for a nonmember costs the base price.

Enter test rows or write a JavaScript `export function test(quoteShipment)` that throws on an unexpected result.
