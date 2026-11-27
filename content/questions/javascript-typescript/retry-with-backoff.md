---
title: How would you retry a receipt lookup when the read endpoint briefly returns 503?
topic: javascript-typescript
roles: [automation, sdet]
level: senior
type: tooling
oneLine: Retry the eligible read failure within a budget, cap and randomize the wait, and preserve the final error.
looksFor:
  - Chooses retryable failures based on the endpoint contract and operation safety.
  - Applies capped exponential backoff with jitter and a total attempt limit.
  - Returns successes promptly and throws the final error unchanged.
  - Keeps the retry policy separate from test assertions and accounts for per-request timeouts.
trap: Retrying every failure, including assertion failures and writes that might already have succeeded.
followUps:
  - question: What if the server supplies Retry-After?
    answer: I'd honor it when it fits the caller's time budget. If it doesn't, I'd surface the failure instead of retrying sooner.
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

I'd retry the receipt read on a 503 if the endpoint contract treats that response as temporary.
The code that checks the HTTP status can translate that response to a specific error. A wrong
receipt, a bad request, or a failed assertion should fail without a retry.

After each eligible failure I'd pick a random delay up to an exponentially growing ceiling,
with a maximum on that ceiling. The jitter spreads out workers that failed together. I'd set a
total attempt budget, give each real request a timeout, and throw the last error if the attempts run
out. I'd apply the helper to the read alone so a test can't hide a product defect by rerunning.

### Example

The read stub fails three times, then returns `R-18`. With a fixed random draw of 0.5, the test sees
waits of 50, 100, and 125 milliseconds, without sleeping.
