---
title: How would you generate a fresh ticket reference on every call without a global counter?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: Return a function that closes over a counter owned by that factory instance.
looksFor:
  - Defines a closure in terms of the scope where a function was created.
  - Shows that each factory instance has its own changing counter.
  - Accounts for parallel workers when choosing the prefix.
  - Explains why deferred callbacks in a var loop can read the same final value.
trap: Using one shared counter for unrelated tests and asserting an exact sequence that depends on test order.
followUps:
  - question: Why can callbacks built in a loop all print the same row number?
    answer: With var, they read the same loop variable when they run. A let loop variable has a separate binding for each iteration.
sources:
  - label: MDN closures and loop bindings
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  - label: Node.js assert
    url: https://nodejs.org/api/assert.html
examples:
  - title: Allocate ticket references per worker
    variants:
      - lang: js
        label: JavaScript (Node.js)
        code: |
          import assert from 'node:assert/strict';

          function ticketReferences(worker) {
            let next = 0;
            return () => `QA-${worker}-${++next}`;
          }

          const nextA = ticketReferences('A');
          const nextB = ticketReferences('B');
          assert.deepEqual([nextA(), nextB(), nextA()], ['QA-A-1', 'QA-B-1', 'QA-A-2']);
---

I'd give each worker a factory for ticket references. The factory creates a counter and returns
a function that can still read and increment it after the factory call ends. That's a closure:
the function keeps access to the variables in the scope where it was created.

Each call to the factory gives me a separate counter. I'd include a worker or run prefix if
the data goes into a shared ticket system. The counter alone gives me uniqueness within one
factory instance. The same rule explains why callbacks created in a `var` loop can all see
the last loop value. They share one binding. With `let` in the loop header, each iteration
has a fresh binding.

### Example

I alternate calls between worker A and worker B. A gets references ending in 1 and 2, and B gets
its own reference ending in 1.
