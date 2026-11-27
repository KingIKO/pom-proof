---
title: Why does the test read the order summary before the requests that create the test orders finish?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: If order matters, I await each seed in a `for...of` loop. If the seeds are independent, I await their promises together.
looksFor:
  - Explain which work finishes on the current call stack.
  - Tell promise continuations apart from tasks that the event loop runs later.
  - Point out that `forEach` discards the promises that the callbacks return.
  - Choose to run setup in order or at the same time, based on whether the seeds depend on each other's data.
trap: Putting `await` outside `forEach` and assuming that it waits for each async callback.
followUps:
  - question: What happens if one seed rejects while the others run at the same time?
    answer: Then `Promise.all` rejects with the first rejection it sees. The other requests can keep running. My cleanup needs to account for any records they created.
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

The `forEach` method calls each callback on the current call stack. The call stack is the code that is running right now. `forEach` discards whatever each callback returns.

An async callback returns a promise when it pauses. A promise is an object that stands for a result that arrives later. As a result, the caller can reach the summary check before the seeds finish. If I await `forEach` itself, I still get no promise that represents those requests.

Once an awaited promise resolves, its continuation runs as a microtask. The continuation is the code after the `await`. In the browser, the event loop picks which work runs next. It runs microtasks after the current stack clears and before the next task, such as a timer callback. That scheduling won't make `forEach` wait.

For dependent seeds, I'd use `for...of` with `await`. For independent requests, I'd use `Promise.all` over `map`.

### Example

The seed stub, a stand-in for the real seed request, pauses once before it adds an order to a store. Both versions wait until their own store contains the two expected order IDs.
