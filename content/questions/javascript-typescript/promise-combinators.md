---
title: Which promises would you wait for when setting up and cleaning up a search test?
topic: javascript-typescript
roles: [automation, sdet]
level: mid
type: concept
oneLine: Choose a combinator based on whether you need every success, every outcome, the first result, or the first success.
looksFor:
  - Uses all for independent setup that needs every result.
  - Uses allSettled and inspects rejections when cleanup must attempt everything.
  - Distinguishes the first settled promise in race from the first fulfillment in any.
  - Explains that settling the combined promise does not cancel the other operations.
trap: Using Promise.any for required setup and proceeding even though most of the fixtures failed.
followUps:
  - question: Does a timeout winning Promise.race stop the request?
    answer: The race settles but the request can keep running. For fetch I can wire an AbortController signal and abort when the timeout wins.
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

For independent setup where every fixture is needed, I'd use `Promise.all`. It returns the values
in input order if they all succeed and rejects as soon as one rejects. For teardown I'd use
`Promise.allSettled` and inspect every outcome. A failed delete should still show up in the report
even when the other deletes worked.

`Promise.race` settles as soon as the first input settles, success or failure. That's useful for
racing a request against a timeout. `Promise.any` takes the first fulfillment, so I'd use it to read
from the first healthy replica. If they all reject, it rejects with an `AggregateError`.

### Example

One search document is locked and the other can be removed. The stub records both attempts. Cleanup
waits for both and returns just the locked document ID as a failure.
