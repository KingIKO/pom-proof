---
problem: code/classify-test-retries
---

Track the last non-skipped outcome and whether a failure occurred. This uses constant extra space and leaves the input unchanged.

```ts
type Outcome = 'passed' | 'failed' | 'skipped';

export function classifyRun(attempts: Outcome[]) {
  let last: 'passed' | 'failed' | undefined;
  let sawFailure = false;
  for (const outcome of attempts) {
    if (outcome === 'skipped') continue;
    last = outcome;
    sawFailure ||= outcome === 'failed';
  }
  if (last === undefined) return 'not-run';
  if (last === 'failed') return 'failed';
  return sawFailure ? 'flaky' : 'passed';
}
```

A set of observed outcomes loses execution order. `["failed", "passed"]` is flaky, while `["passed", "failed"]` still needs investigation.
