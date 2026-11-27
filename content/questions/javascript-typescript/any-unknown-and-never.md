---
title: Which types would you use in a cart test that handles each status separately and reports unexpected errors?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: I narrow a caught `unknown` error, which means I check its type before I read it. I use `never` so that a status switch with a missing case fails type checking.
looksFor:
  - Explain that `any` turns off checking of operations on the value.
  - Narrow an `unknown` value before reading its error properties.
  - Use `never` to make the code handle every known status.
  - Keep runtime checks of the data separate from the compiler's check that every case is handled.
trap: Typing a caught value as `any` and assuming it always has a `message` property.
followUps:
  - question: What changes if a third status is added to the union?
    answer: The default branch can now receive that status. If I pass it to a function that accepts `never`, the compiler reports a type error. The error stays until I handle the new case.
sources:
  - label: TypeScript any
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any
  - label: TypeScript unknown in catch clauses
    url: https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html
  - label: TypeScript narrowing and exhaustiveness
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
  - label: MDN Error cause
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
examples:
  - title: Check every known cart status
    variants:
      - lang: ts
        label: TypeScript
        code: |
          type Cart = { status: 'active' } | { status: 'expired' };

          function unexpected(value: never): never {
            throw new Error(`Unexpected cart: ${JSON.stringify(value)}`);
          }

          function expectedButton(cart: Cart): string {
            switch (cart.status) {
              case 'active': return 'Checkout';
              case 'expired': return 'Start over';
              default: return unexpected(cart);
            }
          }

          function checkButton(cart: Cart, actual: string) {
            try {
              const expected = expectedButton(cart);
              if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
            } catch (error: unknown) {
              const detail = error instanceof Error ? error.message : String(error);
              throw new Error(`Cart button check: ${detail}`, { cause: error });
            }
          }

          checkButton({ status: 'active' }, 'Checkout');
          checkButton({ status: 'expired' }, 'Start over');
---

I'd treat a caught error as `unknown`. That type accepts any value, but the compiler makes me check its type before I use it. With `any`, TypeScript stops checking the value. It lets me read `error.message` even if the thrown value is a string.

With `unknown`, I check `instanceof Error` before I take the message. For any other value, I fall back to converting it to text.

The `never` type has no possible values. My cart status is a union, which is a type that can be any one of several listed options. Once my switch handles every member of the union, the default branch has nothing left. If a new status goes unhandled, a helper that accepts `never` gives me a compiler error in that branch. I'd still validate the response that supplied the status.

### Example

The active and expired cart fixtures, or test carts, each expect a different button. Both checks pass as written. If I add a cart status without handling it, the call to `unexpected` fails type checking.
