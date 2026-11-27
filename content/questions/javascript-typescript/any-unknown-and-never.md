---
title: How would you type a cart check that branches on status and reports unexpected errors?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: Narrow unknown errors before reading them and use never to make an incomplete status switch fail type checking.
looksFor:
  - Explains that any bypasses checking of operations on the value.
  - Narrows unknown before accessing error properties.
  - Uses never to enforce exhaustive handling of known statuses.
  - Keeps runtime data validation separate from the compiler's exhaustiveness check.
trap: Typing a caught value as any and assuming it always has a message property.
followUps:
  - question: What changes if a third status is added to the union?
    answer: The default branch can now receive that status, so passing it to a function that accepts never fails type checking until the new case is handled.
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

I'd treat a caught error as `unknown`. With `any`, TypeScript lets me read `error.message` even
if the thrown value is a string. With `unknown`, the compiler makes me check first. I can use
`instanceof Error` before taking the message and fall back to converting other values to text.

`never` has no possible values. Once my switch handles every member of a status union, the
default branch has nothing left. A helper that accepts `never` gives me a compiler error in that
branch if a new status goes unhandled. I'd still validate the response that supplied the status.

### Example

The active and expired cart fixtures each expect a different button. Both checks pass as written.
Adding an unhandled cart status makes the call to `unexpected` fail type checking.
