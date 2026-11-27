---
title: How would you make a test client return the right type for each warehouse API route?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I make the route a type parameter. Then I look up the request and response types for that route in an endpoint map.
looksFor:
  - Use a generic function whose type parameter links the arguments to the return value.
  - Allow only route keys that exist in the endpoint map.
  - Get the input and output types from the chosen route.
  - Validate untrusted network data at runtime.
trap: Letting callers pick any response type parameter and casting the decoded response to that type without checking it.
followUps:
  - question: At what point would you check that the server sent the stock count as a number?
    answer: I'd check it at the response boundary, after decoding the JSON. A parser for that route can reject data that doesn't match before an assertion uses it.
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

I'd define a map from each route, a path in the API, to its input and output types. A generic function takes a type parameter, which works like an argument for types. In `request<Route extends keyof Warehouse>`, the type parameter `Route` must be a known route. That ties the route to both types.

Given `/stock`, the compiler expects a SKU and returns the stock response type. When the endpoint contract changes, call sites that still expect the old fields fail type checking. If a route variable can hold more than one route, I'd narrow it first. Narrowing means checking which route it holds, so it stays paired with the right input.

This checks the TypeScript side. Casting tells TypeScript to treat a value as a given type without checking the contents. With a real network transport, I'd decode the body as `unknown` and give each route a parser. A static type can't prove what the server actually sent.

### Example

The stub transport, a stand-in for the network, gives `/stock` a SKU input and `/aisle` a numeric aisle input. The case for SKU `P-17` expects eight items. If I passed the aisle argument to `/stock`, it would fail type checking.
