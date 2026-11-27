---
title: How would you catch a payments API returning amount cents as a string in a TypeScript test?
topic: javascript-typescript
roles: [automation, sdet]
level: senior
type: tooling
oneLine: Parse unknown response data with a runtime schema and infer the test's type from that same schema.
looksFor:
  - Distinguishes a type assertion from an actual runtime check.
  - Checks the decoded reply before the test client returns a Payment.
  - Infers the compile-time type from the parser schema.
  - Chooses an explicit policy for extra fields and avoids coercing contract failures.
trap: Casting JSON to Payment and treating the lack of a compiler error as evidence about the API.
followUps:
  - question: Would you reject extra fields?
    answer: I'd check the contract. Use strict parsing when extras are forbidden and accept them when the API allows additive fields.
sources:
  - label: TypeScript type assertions
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
  - label: Zod parsing and type inference
    url: https://zod.dev/basics
  - label: Zod object schemas
    url: https://zod.dev/api#objects
  - label: Node.js assertions
    url: https://nodejs.org/api/assert.html
examples:
  - title: Reject a text amount while decoding the payment
    variants:
      - lang: ts
        label: Zod (TypeScript)
        code: |
          import assert from 'node:assert/strict';
          import { z } from 'zod';

          const PaymentSchema = z.strictObject({
            id: z.string(),
            amountCents: z.number().int().nonnegative(),
          });
          type Payment = z.infer<typeof PaymentSchema>;

          function decodePayment(json: string): Payment {
            const body: unknown = JSON.parse(json);
            return PaymentSchema.parse(body);
          }

          assert.equal(decodePayment('{"id":"P-7","amountCents":2500}').amountCents, 2500);
          assert.throws(
            () => decodePayment('{"id":"P-7","amountCents":"2500"}'),
            z.ZodError,
          );
---

I'd make `decodePayment` earn its return type. It treats the decoded JSON as `unknown` and
returns a `Payment` only after Zod accepts the data. A cast like `as Payment` disappears
from the generated JavaScript. If the server sends `"2500"`, the parser points to `amountCents`
before a test can use the string in a total.

I'd infer the TypeScript type from the schema so I don't have to keep an interface and a validator
in sync. I'd also decide how to handle fields the schema doesn't list. If the contract allows
additions, the test should accept extra fields.

### Example

This checkout endpoint has a closed response shape and sends a nonnegative integer for
`amountCents`. The local check uses Zod to parse two saved bodies. The numeric amount parses,
and the string amount throws a schema error.
