---
title: How would you keep a delivery test builder and its request types in sync?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: Derive fixture overrides, payloads, and settings from shared types with TypeScript utility types.
looksFor:
  - Uses Partial for builder overrides.
  - Uses Pick for an explicit field list and Omit to remove known fields.
  - Uses Required where all settings must be supplied.
  - Uses Record to make an expectation table cover its key union.
trap: Assuming Partial makes nested fields optional or fills missing fixture values at runtime.
followUps:
  - question: Would you choose Pick or Omit for a public request body?
    answer: I'd use Pick when the allowed fields matter, because a new internal field won't automatically become part of the request type.
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

I'd derive the request fields from the delivery type with `Pick`. That makes the allowed fields
visible. `Omit` works for a fixture that wants everything except the server-generated ID, but
I'd be careful about letting future fields flow into a public request automatically.

`Partial` lets a builder take an override for just the field the test cares about. The builder
still supplies defaults at runtime. I can use `Required` when a settings object must supply
every top-level property, and `Record` when a fee table needs an entry for every service.

### Example

The builder sets a default postcode and takes an overnight service override. The test picks
the overnight fee from a table that must also contain the ground fee. If a service is added,
the compiler requires a corresponding table entry.
