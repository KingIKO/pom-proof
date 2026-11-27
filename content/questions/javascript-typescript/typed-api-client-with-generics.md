---
title: How would you make a test client return the right type for each warehouse route?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Use the route as a type parameter and index an endpoint map for the request and response types.
looksFor:
  - Uses a generic function whose type parameter connects arguments and return value.
  - Restricts route keys to the endpoint map.
  - Derives the input and output types from the selected route.
  - Validates untrusted network data at runtime.
trap: Letting callers choose any response type parameter and casting the decoded body to it.
followUps:
  - question: Where should the client check that the server sent a numeric stock count?
    answer: At the response boundary, after decoding the JSON. A route-specific parser can reject incompatible data before an assertion uses it.
sources:
  - label: TypeScript generic constraints
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints
  - label: TypeScript indexed access types
    url: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
  - label: TypeScript mapped types
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
  - label: TypeScript type assertions
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
examples:
  - title: Route an inventory request to a typed in-memory transport
    variants:
      - lang: ts
        label: TypeScript
        code: |
          type Warehouse = {
            '/stock': { input: { sku: string }; output: { onHand: number } };
            '/aisle': { input: { aisle: number }; output: { bins: string[] } };
          };

          type Transport = {
            [Route in keyof Warehouse]: (
              input: Warehouse[Route]['input'],
            ) => Promise<Warehouse[Route]['output']>;
          };

          function makeClient(transport: Transport) {
            return function request<Route extends keyof Warehouse>(
              route: Route,
              input: Warehouse[Route]['input'],
            ): Promise<Warehouse[Route]['output']> {
              return transport[route](input);
            };
          }

          const request = makeClient({
            '/stock': async ({ sku }) => ({ onHand: sku === 'P-17' ? 8 : 0 }),
            '/aisle': async ({ aisle }) => ({ bins: aisle === 2 ? ['B-4'] : [] }),
          });
          const stock = await request('/stock', { sku: 'P-17' });
          if (stock.onHand !== 8) throw new Error('Expected eight items in stock');
          export {};
---

I'd define a map from route to input and output. `request<Route extends keyof Warehouse>` ties
a known route to both types. Given `/stock`, the compiler expects a SKU and returns the
stock response type. When the endpoint contract changes, call sites that still expect the old
fields fail type checking. If a route variable can hold more than one route, I'd narrow it first
so it stays paired with the right input.

This checks the TypeScript side. With a real network transport I'd decode the body as `unknown`
and give each route a parser. A static type can't prove what the server actually sent.

### Example

The stub transport gives `/stock` a SKU input and `/aisle` a numeric aisle input. The case for
SKU `P-17` expects eight items. Passing the aisle argument to `/stock` would fail type checking.
