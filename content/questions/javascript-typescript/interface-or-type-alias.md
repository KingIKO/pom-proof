---
title: Would you use interfaces or type aliases for checkout fixtures and their outcomes?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: Use either for object shapes, and use type aliases where checkout needs a union, tuple, or mapped type.
looksFor:
  - Explains that both interfaces and aliases describe object shapes.
  - Describes interface extension and declaration merging.
  - Uses a type alias for a union of outcomes.
  - Gives a practical naming convention for maintaining test fixtures.
trap: Declaring an interface twice by accident and assuming the second declaration replaces the first.
followUps:
  - question: When would you intentionally reopen an interface?
    answer: I'd do it when a public extension interface is explicitly intended to be augmented. A test's private fixture contract is usually easier to read in one declaration.
sources:
  - label: TypeScript type aliases and interfaces
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces
  - label: TypeScript interface declaration merging
    url: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces
  - label: TypeScript tuple types
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types
  - label: TypeScript mapped types
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
examples:
  - title: Type an express checkout fixture and its expected outcome
    variants:
      - lang: ts
        label: TypeScript
        code: |
          interface CheckoutFixture {
            cartId: string;
            totalCents: number;
          }

          interface ExpressFixture extends CheckoutFixture {
            postcode: string;
          }

          type Outcome = { kind: 'placed'; trackingId: string }
            | { kind: 'rejected'; reason: 'outside-area' };

          const fixture: ExpressFixture = { cartId: 'C-14', totalCents: 1800, postcode: '99999' };
          const expected: Outcome = { kind: 'rejected', reason: 'outside-area' };
          const testCase = { fixture, expected };
---

Either can describe a fixture with named fields. I'd use an interface for the shared checkout
fixture and let express checkout extend it with the delivery postcode. An interface can also
merge with another declaration of the same name in the same scope. Type aliases can't be
reopened that way.

I'd use a type alias for the checkout result, because it can be a union of two distinct
shapes. Aliases can also name tuples and mapped types. My team convention would be interfaces
for extendable object contracts and aliases for the alternatives or derived types we build
from those contracts.

### Example

The express fixture adds a postcode to the base checkout fields. The case expects a rejection
for an out-of-area postcode. The compiler checks that the rejection carries a reason and that
the express fixture supplies the postcode.
