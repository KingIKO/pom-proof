---
title: How can each call make a new ticket reference without using a counter the whole program can access?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: I return a closure, which is a function that keeps access to a counter. That counter belongs to one factory instance.
looksFor:
  - Define a closure by the scope where its function was created.
  - Show that each factory instance has its own counter that changes.
  - Account for parallel workers when choosing the prefix.
  - Explain why delayed callbacks in a `var` loop can read the same final value.
trap: Using one shared counter for unrelated tests and asserting an exact sequence. That sequence depends on the order the tests run in.
followUps:
  - question: Why might every callback you create in a loop print the same row number?
    answer: If I use `var`, they all read the same loop variable when they run. If I use `let`, the loop variable has a separate binding for each iteration.
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

I'd give each worker a factory for ticket references. A factory is a function that builds and returns something. This factory creates a counter and returns a function. That function can still read and increment the counter after the factory call ends.

The returned function is a closure. A closure keeps access to the variables in the scope where it was created.

Each call to the factory gives me a separate counter. The counter alone makes references unique within one factory instance. If the data goes into a shared ticket system, I'd include a worker or run prefix.

The same rule explains why callbacks created in a `var` loop can all see the last loop value. They share one binding, which is the link between a name and its value. If I put `let` in the loop header, each iteration has a fresh binding.

### Example

I alternate calls between worker A and worker B. Worker A gets references ending in 1 and 2. Worker B gets its own reference ending in 1.
