---
title: How would a TypeScript test catch a payments API returning the amount in cents as text?
topic: javascript-typescript
roles: [automation, sdet]
level: senior
type: tooling
oneLine: I parse unknown response data with a runtime schema. I infer the test's type from that same schema.
looksFor:
  - Tell a type assertion apart from an actual runtime check.
  - Check the decoded reply before the test client returns a `Payment`.
  - Infer the compile-time type from the parser schema.
  - Choose an explicit rule for extra fields, and avoid converting data that breaks the contract into the expected type.
trap: Casting JSON to `Payment` and treating the lack of a compiler error as evidence about the API.
followUps:
  - question: When would you reject a response that has fields you didn't expect?
    answer: I'd check the contract. If it forbids extra fields, I use strict parsing. If the API allows new fields to be added, I accept them.
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

I'd make `decodePayment` check the data before it can return a `Payment`. It treats the decoded JSON as `unknown`. Zod, a validation library, then checks the data against a schema. A schema describes the expected shape in a form the code can check at runtime. The function returns a `Payment` only after Zod accepts the data.

A cast like `as Payment` disappears from the generated JavaScript. So the cast checks nothing at runtime. If the server sends `"2500"`, the parser points to `amountCents`. It does that before a test can use the string in a total.

I'd infer the TypeScript type from the schema. Then I don't have to keep an interface and a validator in sync. I'd also decide how to handle fields the schema doesn't list. If the contract allows additions, the test should accept extra fields.

### Example

This checkout endpoint has a closed response shape, which allows no unlisted fields. It sends a nonnegative integer for `amountCents`. The local check uses Zod to parse two saved bodies. The numeric amount parses, and the string amount throws a schema error.
