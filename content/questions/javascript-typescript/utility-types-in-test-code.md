---
title: How would you keep the code that builds delivery test data up to date when the request types change?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: I use TypeScript utility types to build fixture overrides, payloads, and settings from shared types.
looksFor:
  - Use `Partial` for builder overrides.
  - Use `Pick` for an explicit list of fields and `Omit` to remove known fields.
  - Use `Required` where every setting must be supplied.
  - Use `Record` so that an expectation table must cover every key in its union.
trap: Assuming `Partial` makes nested fields optional or fills missing fixture values at runtime.
followUps:
  - question: Would you choose `Pick` or `Omit` for a public request body?
    answer: When the allowed fields matter, I'd use `Pick`. With `Pick`, a new internal field won't automatically become part of the request type.
sources:
  - label: TypeScript utility types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
  - label: TypeScript type assertions
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
examples:
  - title: Build an overnight delivery request from a fixture
    variants:
      - lang: ts
        label: TypeScript
        code: |
          type Service = 'ground' | 'overnight';
          type Delivery = { id: string; postcode: string; service: Service };
          type CreateDelivery = Pick<Delivery, 'postcode' | 'service'>;
          type SeedDelivery = Omit<Delivery, 'id'>;
          type Settings = { useSandbox?: boolean };

          const settings: Required<Settings> = { useSandbox: true };
          const expectedFee: Record<Service, number> = { ground: 500, overnight: 1200 };

          function buildDelivery(overrides: Partial<CreateDelivery> = {}): CreateDelivery {
            return { postcode: '10001', service: 'ground', ...overrides };
          }

          const fixture: SeedDelivery = buildDelivery({ service: 'overnight' });
          if (!settings.useSandbox || expectedFee[fixture.service] !== 1200) {
            throw new Error('Expected the sandbox overnight delivery fee');
          }
---

Utility types are built-in TypeScript types that make a new type from an existing one. I'd build the request fields from the delivery type with `Pick`. That makes the allowed fields visible.

`Omit` works for a fixture that wants everything except the server-generated ID. For a public request, I'd be careful with it. It could let future fields flow into that request automatically.

`Partial` lets a builder take an override for just the field the test cares about. A builder is a function that makes a full fixture from default values. The builder still supplies those defaults at runtime.

I can use `Required` when a settings object must supply every top-level property. I can use `Record` when a fee table needs an entry for every service.

### Example

The builder sets a default postcode and takes an override for the overnight service. The test reads the overnight fee from a fee table. That table must also contain the ground fee. If a service is added, the compiler requires a matching table entry.
