---
title: Turn test attempts into one result
kind: code
topic: reporting
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: classifyRun
starters:
  js: |
    export function classifyRun(attempts) {
    }
  ts: |
    type Outcome = 'passed' | 'failed' | 'skipped';
    type Result = 'not-run' | 'passed' | 'flaky' | 'failed';

    export function classifyRun(attempts: Outcome[]): Result {
      return 'not-run';
    }
  python: |
    def classify_run(attempts):
        return "not-run"
vectors:
  - { name: empty, args: [[]], expected: not-run }
  - { name: skipped-only, args: [[skipped]], expected: not-run }
  - { name: first-pass, args: [[skipped, passed]], expected: passed }
  - { name: recovered, args: [[failed, skipped, passed, skipped]], expected: flaky }
  - { name: failed-last, args: [[passed, failed, skipped]], expected: failed }
  - { name: all-failed, args: [[failed, failed]], expected: failed }
reference:
  language: js
  source: |
    export function classifyRun(attempts) {
      const executed = attempts.filter((outcome) => outcome !== 'skipped');
      const last = executed.at(-1);
      if (last === undefined) return 'not-run';
      if (last === 'failed') return 'failed';
      return executed.includes('failed') ? 'flaky' : 'passed';
    }
solutions:
  js: |
    export function classifyRun(attempts) {
      const executed = attempts.filter((outcome) => outcome !== 'skipped');
      const last = executed.at(-1);
      if (last === undefined) return 'not-run';
      if (last === 'failed') return 'failed';
      return executed.includes('failed') ? 'flaky' : 'passed';
    }
  ts: |
    type Outcome = 'passed' | 'failed' | 'skipped';
    type Result = 'not-run' | 'passed' | 'flaky' | 'failed';

    export function classifyRun(attempts: Outcome[]): Result {
      const executed = attempts.filter((outcome) => outcome !== 'skipped');
      const last = executed.at(-1);
      if (last === undefined) return 'not-run';
      if (last === 'failed') return 'failed';
      return executed.includes('failed') ? 'flaky' : 'passed';
    }
  python: |
    def classify_run(attempts):
        executed = [outcome for outcome in attempts if outcome != "skipped"]
        if not executed:
            return "not-run"
        if executed[-1] == "failed":
            return "failed"
        return "flaky" if "failed" in executed else "passed"
decoy:
  language: js
  source: |
    export function classifyRun(attempts) {
      if (attempts.includes('passed')) return attempts.includes('failed') ? 'flaky' : 'passed';
      return attempts.includes('failed') ? 'failed' : 'not-run';
    }
---

The QA report needs one result for all attempts at the same test. Write the `classifyRun(attempts)` function in JavaScript, TypeScript, or Python. It gets an array of results in the order the attempts happened. Each result is `passed`, `failed`, or `skipped`.

Ignore skipped attempts before you choose the result. A `flaky` result means the test failed at least once and passed on its last attempt that ran.

| After you ignore skips | Return |
| --- | --- |
| No attempts are left | `not-run` |
| The last attempt failed | `failed` |
| The last attempt passed after at least one failure | `flaky` |
| The last attempt passed with no failures | `passed` |

For example, given `["passed", "failed", "skipped"]`, return `"failed"`. Leave the input array unchanged.
