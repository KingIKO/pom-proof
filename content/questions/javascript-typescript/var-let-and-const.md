---
title: How would you declare a test data URL and a counter that changes on each retry?
topic: javascript-typescript
roles: [automation, sdet]
level: junior
type: concept
oneLine: I use `const` for bindings I keep and `let` for bindings I reassign. I watch for `var`, because it can leak past the end of a block.
looksFor:
  - Tell function-scoped `var` apart from block-scoped `let` and `const`.
  - Explain why `var` reads as `undefined` before initialization and what the temporal dead zone means for `let` and `const`.
  - Describe the rules for declaring the same name twice within a scope.
  - Tell reassignment apart from changes to an object bound with `const`.
trap: Assuming `const` prevents a fixture object from being changed by another test that shares it.
followUps:
  - question: Can I declare a new `let` named `count` inside a nested block?
    answer: Yes. That creates a separate binding. If I declare the same `let` name twice in the same scope, I get a syntax error.
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

I'd use `const` for the fixture URL and `let` for a counter I reassign. A binding is the link between a name and its value. Both declarations are block scoped, so each binding belongs to the block, the code between braces, that contains it.

Their bindings exist from the start of the block. If I read one before it gets its initial value, JavaScript throws. That period is called the temporal dead zone.

Inside a function, `var` is function scoped. Its declaration is hoisted, which means the name exists from the start of the function. An early read gives `undefined`, because the initializer hasn't run.

A `var` can be redeclared with `var` in the same scope. `let` and `const` reject a second declaration in the same scope. A `const` object can still change. Only the binding is fixed. I'd create a new fixture for each test instead of relying on `const` to isolate it.

### Example

The seed stub, a stand-in for the real seed request, records a 503 and then a 201. The reference to the trace stays fixed while its attempt list grows. Each loop iteration has its own `status` binding.
