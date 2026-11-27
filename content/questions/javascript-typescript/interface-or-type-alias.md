---
title: Which would you choose for checkout test data and results, an interface or a type alias?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: I use either one for object shapes. When checkout needs a union, tuple, or mapped type, I use a type alias.
looksFor:
  - Explain that both interfaces and type aliases describe object shapes.
  - Describe how an interface extends another and how two declarations of one interface merge.
  - Use a type alias for a union of outcomes.
  - Give a practical naming convention for maintaining test fixtures.
trap: Expecting the second declaration of an interface to replace the first if you accidentally give both the same name.
followUps:
  - question: When would you reopen an interface on purpose?
    answer: I'd do it when a public extension interface is explicitly intended to be augmented, which means other code adds fields to it. A test's private fixture contract is usually easier to read in one declaration.
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

An interface and a type alias can both describe a fixture with named fields. A fixture here is the test data for one checkout. I'd use an interface for the shared checkout fixture. I'd let the express checkout fixture extend it, which adds the delivery postcode to the shared fields.

An interface can also merge with another declaration of the same name in the same scope. Type aliases can't be reopened that way.

I'd use a type alias for the checkout result, because the result can be a union of two distinct shapes. A union means the value matches one of the listed shapes. Aliases can also name tuples and mapped types. A tuple is an array with a fixed type at each position. A mapped type builds a new type from the keys of another type.

My team convention would be interfaces for object contracts we can extend. We'd use aliases for the alternatives or derived types we build from those contracts.

### Example

The express fixture adds a postcode to the base checkout fields. The test case expects a rejection for a postcode outside the delivery area. The compiler checks that the rejection carries a reason. It also checks that the express fixture supplies the postcode.
