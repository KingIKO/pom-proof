---
title: If a request to read a receipt briefly returns 503, how would you retry it?
topic: javascript-typescript
roles: [automation, sdet]
level: senior
type: tooling
oneLine: I retry a read failure that qualifies for a retry, within an attempt budget. I cap and randomize each wait, and I keep the final error unchanged.
looksFor:
  - Choose which failures to retry based on the endpoint contract and whether the operation is safe to repeat.
  - Apply capped exponential backoff with jitter and a total attempt limit.
  - Return a success right away and throw the final error unchanged.
  - Keep the retry policy separate from test assertions and account for a timeout on each request.
trap: Retrying even when a test check failed or a request might already have saved a change.
followUps:
  - question: What if the server sends a `Retry-After` header?
    answer: If its wait fits the caller's time budget, I'd honor it. If it doesn't fit, I'd report the failure instead of retrying sooner.
sources:
  - label: AWS guidance on retry budgets, backoff, and jitter
    url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
  - label: MDN safe and idempotent HTTP GET
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET
  - label: MDN HTTP 503 and Retry-After
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503
  - label: MDN Math.random
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  - label: TypeScript generics
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html
examples:
  - title: Check retry delays using a fixed random draw
    variants:
      - lang: ts
        label: TypeScript
        code: |
          class ServiceUnavailable extends Error {}

          async function readWithRetry<T>(
            read: () => Promise<T>,
            wait: (ms: number) => Promise<void>,
            random = Math.random,
          ): Promise<T> {
            for (let attempt = 1; ; attempt++) {
              try {
                return await read();
              } catch (error) {
                if (!(error instanceof ServiceUnavailable) || attempt === 4) throw error;
                const limit = Math.min(250, 100 * 2 ** (attempt - 1));
                await wait(random() * limit);
              }
            }
          }

          const pauses: number[] = [];
          let calls = 0;
          const receipt = await readWithRetry(
            async () => {
              if (++calls <= 3) throw new ServiceUnavailable('Receipt store busy');
              return 'R-18';
            },
            async ms => { pauses.push(ms); },
            () => 0.5,
          );
          if (receipt !== 'R-18' || pauses.join(',') !== '50,100,125') {
            throw new Error(`Unexpected read result or retry delays: ${receipt}, ${pauses}`);
          }
          export {};
---

If the rules for the receipt endpoint treat a 503 status as temporary, I'd retry the read. The endpoint is where the client sends the request. The code that checks the HTTP status can turn that response into a specific error. A wrong receipt, a bad request, or a failed test check should fail without a retry.

After each eligible failure, I'd wait for a random delay. The delay can go up to a ceiling that grows by a fixed factor after each attempt. The ceiling itself has a maximum. This pattern is called capped exponential backoff. The random part is called jitter, and it spreads out workers that failed together.

I'd set a total attempt budget and give each real request a timeout. If the attempts run out, I throw the last error. I'd apply the helper to the read alone. That way a test can't hide a product defect by rerunning.

### Example

The read stub, a stand-in for the real read, fails three times and then returns `R-18`. The test fixes the random draw at 0.5. It then sees waits of 50, 100, and 125 milliseconds, without actually sleeping.
