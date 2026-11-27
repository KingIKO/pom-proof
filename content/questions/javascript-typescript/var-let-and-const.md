---
title: Which declarations would you use for a fixture URL and a counter that changes on retry?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: Use const for bindings you keep, let for bindings you reassign, and watch for var leaking past a block.
looksFor:
  - Distinguishes function-scoped var from block-scoped let and const.
  - Explains undefined before var initialization and the temporal dead zone for let and const.
  - Describes redeclaration rules within a scope.
  - Separates reassignment from changes to an object bound with const.
trap: Assuming const prevents a fixture object from being changed by another test that shares it.
followUps:
  - question: Can I declare a new let count inside a nested block?
    answer: Yes, that creates a separate binding. Declaring the same let name twice in the same scope is a syntax error.
sources:
  - label: MDN var
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var
  - label: MDN let
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
  - label: MDN const
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
  - label: Node.js assert
    url: https://nodejs.org/api/assert.html
examples:
  - title: Keep retry state local to one fixture
    variants:
      - lang: js
        label: JavaScript (Node.js)
        code: |
          import assert from 'node:assert/strict';

          function trackSeed(url, send) {
            const trace = { attempts: [] };
            let attempt = 0;

            for (const path of [url, url]) {
              const status = send(path);
              trace.attempts.push({ attempt: ++attempt, status });
              if (status === 201) break;
            }
            return trace;
          }

          const url = '/api/reports';
          const replies = [503, 201];
          const trace = trackSeed(url, path => {
            assert.equal(path, url);
            return replies.shift();
          });
          assert.deepEqual(trace.attempts, [
            { attempt: 1, status: 503 },
            { attempt: 2, status: 201 },
          ]);
---

I'd use `const` for the fixture URL and `let` for a counter I reassign. Both are block scoped.
Their bindings exist from the start of the block, but reading them before initialization throws
because they're in the temporal dead zone. `var` is function scoped inside a function. Its
declaration is hoisted and an early read gives `undefined`, because the initializer hasn't run.

A `var` can be redeclared with `var` in the same scope. `let` and `const` reject same-scope
redeclarations. A `const` object can still change; only the binding is fixed. I'd create
a new fixture for each test rather than rely on `const` to isolate it.

### Example

The seed stub records a 503 and a subsequent 201. The reference to the trace stays fixed while
its attempt list grows. Each loop iteration has its own `status` binding.
