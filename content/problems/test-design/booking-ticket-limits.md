---
title: Check age and ticket limits for a booking
kind: test-design
topic: boundary-testing
difficulty: easy
minutes: 8
roles: [manual-qa, automation]
exportName: checkBooking
params:
  - { name: age, type: number, label: Buyer age (years) }
  - { name: quantity, type: number, label: Tickets requested }
implementation: |
  export function checkBooking(age, quantity) {
    if (age < 18) return 'age-restricted';
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 6) return 'accepted';
    return 'quantity-invalid';
  }
mutants:
  - name: excludes-minimum-age
    teaches: Try the youngest buyer who qualifies, with a valid ticket count.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age <= 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: admits-underage-buyer
    teaches: Try the closest underage buyer, with a valid ticket count.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 17) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: excludes-smallest-booking
    teaches: Try the smallest allowed booking with a buyer who qualifies.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity > 1 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: accepts-below-minimum
    teaches: Try a ticket count immediately below the minimum for an eligible buyer.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 0 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: excludes-largest-booking
    teaches: Try a booking exactly at the ticket limit.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity < 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: accepts-above-maximum
    teaches: Try the closest whole ticket count above the limit.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 7) return 'accepted';
        return 'quantity-invalid';
      }
  - name: accepts-fractional-quantity
    teaches: Try a fractional ticket count within the allowed range for whole counts.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (quantity >= 1 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
reference:
  source: |
    export function test(checkBooking) {
      const cases = [
        [17, 3, 'age-restricted'], [18, 3, 'accepted'], [19, 3, 'accepted'],
        [30, 0, 'quantity-invalid'], [30, 1, 'accepted'], [30, 2, 'accepted'],
        [30, 5, 'accepted'], [30, 6, 'accepted'], [30, 7, 'quantity-invalid'],
        [30, 2.5, 'quantity-invalid'],
      ];
      for (const [age, quantity, expected] of cases) {
        const actual = checkBooking(age, quantity);
        if (actual === expected) continue;
        throw new Error(`Age ${age}, tickets ${quantity}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [17, 3], expected: age-restricted }
    - { args: [18, 3], expected: accepted }
    - { args: [19, 3], expected: accepted }
    - { args: [30, 0], expected: quantity-invalid }
    - { args: [30, 1], expected: accepted }
    - { args: [30, 2], expected: accepted }
    - { args: [30, 5], expected: accepted }
    - { args: [30, 6], expected: accepted }
    - { args: [30, 7], expected: quantity-invalid }
    - { args: [30, 2.5], expected: quantity-invalid }
decoy:
  rows:
    - { args: [18, 6], expected: accepted }
    - { args: [12, 2], expected: age-restricted }
    - { args: [35, 10], expected: quantity-invalid }
---

A venue sells up to six tickets per booking. `checkBooking(age, quantity)` receives the buyer's age in completed years (a nonnegative whole number) and the requested quantity (a finite number).

- A buyer under 18 gets `"age-restricted"`, even if the quantity is also invalid.
- For a buyer aged 18 or older, a whole quantity from 1 through 6 inclusive gets `"accepted"`. Any other quantity gets `"quantity-invalid"`.

Enter test rows or write a JavaScript `export function test(checkBooking)` that throws on an unexpected result.
