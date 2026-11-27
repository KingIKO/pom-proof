---
title: How would you choose what to wait for while you set up a search test and clean up afterward?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: I pick a promise combinator based on what I need. That is every success, every outcome, the first result, or the first success.
looksFor:
  - Use `Promise.all` for independent setup that needs every result.
  - If cleanup must attempt everything, use `Promise.allSettled` and inspect the rejections.
  - Tell the first settled promise in `Promise.race` apart from the first fulfillment in `Promise.any`.
  - Explain that settling the combined promise does not cancel the other operations.
trap: Using `Promise.any` for required setup and going ahead even though most of the fixtures failed.
followUps:
  - question: If a timeout wins `Promise.race`, does that stop the request?
    answer: The race settles, but the request can keep running. For `fetch`, I can connect an `AbortController` signal and abort the request when the timeout wins.
sources:
  - label: MDN Promise concurrency methods
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
  - label: MDN AbortController
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
examples:
  - title: Report every search fixture that failed to clean up
    variants:
      - lang: ts
        label: TypeScript
        code: |
          async function cleanUp(ids: string[], remove: (id: string) => Promise<void>) {
            const jobs = ids.map(async id => remove(id));
            const outcomes = await Promise.allSettled(jobs);
            return ids.filter((_, index) => outcomes[index]?.status === 'rejected');
          }

          async function testCleanup() {
            const attempted: string[] = [];
            const failures = await cleanUp(['doc-7', 'doc-9'], async id => {
              attempted.push(id);
              if (id === 'doc-7') throw new Error('Search index still locked');
            });
            if (attempted.join(',') !== 'doc-7,doc-9' || failures.join(',') !== 'doc-7') {
              throw new Error('Cleanup must attempt both removals and report doc-7');
            }
          }

          await testCleanup();
          export {};
---

A promise stands for a result that arrives later. It settles when it either fulfills with a value or rejects with an error. A combinator takes several promises and returns one combined promise.

If the setup steps are independent and every fixture is needed, I'd use `Promise.all`. If they all succeed, it returns the values in input order. It rejects as soon as one input rejects.

For teardown, the cleanup after the test, I'd use `Promise.allSettled` and inspect every outcome. A failed delete should still show up in the report even when the other deletes worked.

`Promise.race` settles as soon as the first input settles, with either success or failure. That's useful for racing a request against a timeout. `Promise.any` takes the first fulfillment, so I'd use it to read from the first healthy replica. A replica is a copy of the same data on another server. If every input rejects, `Promise.any` rejects with an `AggregateError`.

### Example

One search document is locked, and the other can be removed. The stub, a stand-in for the real delete call, records both attempts. Cleanup waits for both attempts. It returns only the locked document ID as a failure.
