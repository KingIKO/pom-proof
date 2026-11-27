---
title: Why does an order batch test read its summary before the seed requests finish?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: Await each seed in a for-of loop when order matters, or await the promises together when the seeds are independent.
looksFor:
  - Explains what completes on the current call stack.
  - Distinguishes promise continuations from later event-loop tasks.
  - Identifies that forEach discards the promises returned by the callbacks.
  - Chooses sequential or concurrent setup according to data dependencies.
trap: Putting await outside forEach and assuming that waits for each async callback.
followUps:
  - question: What happens if one concurrent seed rejects?
    answer: Promise.all rejects with the first rejection it sees, but other requests can keep running. Cleanup needs to account for any records they created.
sources:
  - label: MDN JavaScript execution model
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
  - label: MDN await and microtasks
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  - label: MDN Array.forEach
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
  - label: MDN Promise.all
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
  - label: Node.js assert
    url: https://nodejs.org/api/assert.html
examples:
  - title: Wait for the order fixtures before reading them
    variants:
      - lang: js
        label: JavaScript (Node.js)
        code: |
          import assert from 'node:assert/strict';

          const ids = ['O-18', 'O-24'];

          async function seed(store, id) {
            await Promise.resolve();
            store.add(id);
          }

          const sequential = new Set();
          for (const id of ids) {
            await seed(sequential, id);
          }

          const concurrent = new Set();
          await Promise.all(ids.map(id => seed(concurrent, id)));

          assert.deepEqual(sequential, new Set(ids));
          assert.deepEqual(concurrent, new Set(ids));
---

`forEach` calls each callback on the current stack and discards what it returns. An async callback
returns a promise when it pauses, so the caller can reach the summary check before the seeds
finish. Awaiting `forEach` itself still gives me no promise that represents those requests.

Once an awaited promise resolves, its continuation runs as a microtask. In the browser event loop,
microtasks run after the current stack clears and before the next task, such as a timer callback.
That scheduling won't make `forEach` wait. I'd use `for...of` with `await` for dependent seeds and
`Promise.all` over `map` for independent requests.

### Example

The seed stub yields once before adding an order to a store. Both versions wait until their own
store contains the two expected order IDs.
