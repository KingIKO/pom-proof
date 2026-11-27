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
    teaches: Use a valid ticket count and the youngest age that qualifies.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age <= 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: admits-underage-buyer
    teaches: Use a valid ticket count and the oldest age below the limit.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 17) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: excludes-smallest-booking
    teaches: Use a buyer who qualifies and the smallest allowed ticket count.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity > 1 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: accepts-below-minimum
    teaches: Use a buyer who qualifies and one ticket fewer than the minimum.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 0 && quantity <= 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: excludes-largest-booking
    teaches: Use exactly the maximum number of tickets in one booking.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity < 6) return 'accepted';
        return 'quantity-invalid';
      }
  - name: accepts-above-maximum
    teaches: Try one whole ticket more than the maximum.
    implementation: |
      export function checkBooking(age, quantity) {
        if (age < 18) return 'age-restricted';
        if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 7) return 'accepted';
        return 'quantity-invalid';
      }
  - name: accepts-fractional-quantity
    teaches: Try a fraction within the range the venue allows for whole ticket counts.
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

A venue sells up to six tickets per booking. The `checkBooking(age, quantity)` function takes the buyer's age in completed years and the number of tickets they want. Age is a whole number of zero or more. Quantity is a finite number.

- If the buyer is under 18, return `"age-restricted"` even if the quantity is also invalid.
- If the buyer is 18 or older, return `"accepted"` for a whole quantity from 1 through 6, including both ends. Return `"quantity-invalid"` for any other quantity.

Enter test rows or write the JavaScript function `export function test(checkBooking)`. If a result differs from what you expect, the function must throw.
